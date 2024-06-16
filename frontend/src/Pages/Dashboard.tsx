import { Component, onMount, createSignal, onCleanup, createEffect } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { PanelGroup, Panel, ResizeHandle } from "solid-resizable-panels";
import "solid-resizable-panels/styles.css";

import TopMenu from '../Components/TopMenu';
import ConfigMenu from '../Components/Dialogs/ConfigMenu';
import ErrorMessage from '../Components/Dialogs/ErrorMessage';
import DeleteBoard from '../Components/Dialogs/DeleteBoard';
import OtaMenu from '../Components/Dialogs/OtaMenu';
import { BoardConfig, loadConfigApi, editBoardApi, downloadBoardDataApi, otaUpdateApi } from '../Api/Board';
import { IParameterSignals } from '../Api/Parameter';
import { IChartSignals } from '../Api/Chart';
import { IGaugeSignals } from '../Api/Gauge';
import { IMapSignals } from '../Api/Map';
import { authorizedFetch } from '../Api/Fetch';
import DbTable from '../Components/Dashboard/Table/DbTable';
import DbCharts from '../Components/Dashboard/Chart/DbCharts';
import DbMaps from '../Components/Dashboard/Maps/DbMaps';
import L from 'leaflet';
import { MIN_SCREEN_WIDTH_PX } from '../Constants/Constants';
import DbGauges from '../Components/Dashboard/Gauges/DbGauges';
import { BoardData } from '../Api/Board';

const Dashboard: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = createSignal('');
  const [deleteDialogBoard, setDeleteDialogBoard] = createSignal('');
  const [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  const [isOtaMenuOn, setIsOtaMenuOn] = createSignal(false);
  const [configMenuBoard, setConfigMenuBoard] = createSignal('');
  const [otaMenuBoard, setOtaMenuBoard] = createSignal('');
  const [parameters, setParameters] = createSignal<IParameterSignals[]>([]);
  const [charts, setCharts] = createSignal<IChartSignals[]>([]);
  const [gauges, setGauges] = createSignal<IGaugeSignals[]>([]);
  const [maps, setMaps] = createSignal<IMapSignals[]>([]);
  const [screenWidth, setScreenWidth] = createSignal(window.innerWidth);
  const [maxElemsPerChart, setMaxElemsPerChart] = createSignal(0);

  let intervalId: number;
  let lastTimeStamp: number = 0;

  const prepareEditBoard = (board: string) => {
    setConfigMenuBoard(board);
    setIsConfigMenuOn(true);
  }

  const prepareDownloadBoardData = async (board: string) => {
    try {
      await downloadBoardDataApi(params.username, board);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  const prepareOtaUpdate = (board: string) => {
    setOtaMenuBoard(board);
    setIsOtaMenuOn(true);
  }

  const deleteBoardCb = async (boardToBeDeleted: string) => {
    navigate(`/home/${params.username}`)
  };

  const configMenuCb = async (newConfig: BoardConfig, oldBoardName?: string | undefined, deleteStoredData?: boolean) => {
    if (oldBoardName !== undefined) {
      await editBoardApi(params.username, newConfig, oldBoardName, deleteStoredData);
      deInit();
      await init();
    } else {
      throw new Error("the board you are trying to edit does not exist anymore!");
    }
  }

  const getData = async () => {
    try {
      const response = await authorizedFetch(params.username, `/api/${params.username}/data/${params.board}/${maxElemsPerChart()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Could not communicate with the server! Please refresh!');
      }
      const boardData: BoardData = await response.json();

      if (lastTimeStamp === boardData.LastTimeStamp) {
        return;
      } else {
        lastTimeStamp = boardData.LastTimeStamp;
      }
      setMaxElemsPerChart(boardData.MaxElemsPerChart);

      if (boardData.Data !== null) {
        if (boardData.Data.length > 0) {
          /* Update table */
          let lastData = boardData.Data[boardData.Data.length - 1]
          for (let i = 0; i < parameters().length && i < lastData.length; i++) {
            parameters()[i].Value[1](lastData[i]);
          }
          if (parameters().length > lastData.length) {
            for (let i = lastData.length; i < parameters().length; i++) {
              parameters()[i].Value[1]("");
            }
          }

          /* Update charts */
          if (boardData.Data.length < maxElemsPerChart()) {
            for (let chartIdx = 0; chartIdx < charts().length; chartIdx++) {
              const chart = charts()[chartIdx]?.Ref;
              if (chart !== undefined) {
                chart.data.labels = new Array(boardData.Data.length);
                for (let oyIdx = 0; oyIdx < charts()[chartIdx].Oy[0]().length; oyIdx++) {
                  chart.data.datasets[oyIdx].data = new Array(boardData.Data.length);
                }
              }
            }
          }
          for (let chartIdx = 0; chartIdx < charts().length; chartIdx++) {
            const chart = charts()[chartIdx]?.Ref;
            if (chart !== undefined) {
              for (let set = 0; set < boardData.Data.length; set++) {
                chart.data.labels![set] = boardData.Data[set][charts()[chartIdx].Ox[0]()];
                for (let oyIdx = 0; oyIdx < charts()[chartIdx].Oy[0]().length; oyIdx++) {
                  chart.data.datasets[oyIdx].data[set] = Number(boardData.Data[set][charts()[chartIdx].Oy[0]()[oyIdx].Index[0]()]) *
                    charts()[chartIdx].Oy[0]()[oyIdx].Scale[0]();
                }
              }

              chart.update();
            }
          }

          /*Update Map */
          for (let mapIdx = 0; mapIdx < maps().length; mapIdx++) {
            if (maps()[mapIdx].Live[0]()) {
              const coords = L.latLng(
                Number(boardData.Data[boardData.Data.length - 1][maps()[mapIdx].Lat[0]()]),
                Number(boardData.Data[boardData.Data.length - 1][maps()[mapIdx].Lon[0]()]),
                Number(boardData.Data[boardData.Data.length - 1][maps()[mapIdx].Alt[0]()]),
              );
              maps()[mapIdx].Marker?.setLatLng(coords);
              maps()[mapIdx].Marker?.setPopupContent(`Lat: ${coords.lat}, Lon: ${coords.lng}, Alt: ${coords.alt}`);
              maps()[mapIdx].Ref?.setView(coords, 25);
            }
          }

          /* Update Gauges */
          for (let gaugeIdx = 0; gaugeIdx < gauges().length; gaugeIdx++) {
            const value = Number(boardData.Data[boardData.Data.length - 1][gauges()[gaugeIdx].Index[0]()]);
            let normalizedValue = ((value - gauges()[gaugeIdx].Min[0]()) / (gauges()[gaugeIdx].Max[0]() - gauges()[gaugeIdx].Min[0]()) * 100);
            gauges()[gaugeIdx].Value[1](value);
            if (normalizedValue < 0) {
              normalizedValue = 0;
            } else if (normalizedValue > 100) {
              normalizedValue = 100;
            }
            gauges()[gaugeIdx].Ref?.updateSeries([normalizedValue]);
          }
        }
      }

      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  const init = async () => {
    try {
      await loadConfigApi(
        params.username,
        params.board,
        [maxElemsPerChart, setMaxElemsPerChart],
        [parameters, setParameters],
        [charts, setCharts],
        [gauges, setGauges],
        [maps, setMaps]
      )

      await getData();
      intervalId = setInterval(getData, 1000);

    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  const deInit = () => {
    clearInterval(intervalId);
  }

  onMount(init);
  onCleanup(deInit);

  const handleScreenSize = () => {
    setScreenWidth(window.innerWidth);
  };

  createEffect(() => {
    window.addEventListener('resize', handleScreenSize);
    return () => {
      window.removeEventListener('resize', handleScreenSize);
    };
  });

  return (
    <div class="flex flex-col h-screen">
      <div>
        <TopMenu
          username={params.username}
          boardMenu={{
            board: params.board,
            editCb: prepareEditBoard,
            otaCb: prepareOtaUpdate,
            downloadCb: prepareDownloadBoardData,
            deleteCb: setDeleteDialogBoard,
          }} />
        {
          isConfigMenuOn() &&
          <ConfigMenu
            username={params.username}
            board={configMenuBoard()}
            cb={configMenuCb}
            show={[isConfigMenuOn, setIsConfigMenuOn]}>
          </ConfigMenu>
        }
        <ErrorMessage errorMsg={[errorMessage, setErrorMessage]} />
        <OtaMenu
          username={params.username}
          board={otaMenuBoard()}
          show={[isOtaMenuOn, setIsOtaMenuOn]}>
        </OtaMenu>
        <DeleteBoard
          username={params.username}
          board={[deleteDialogBoard, setDeleteDialogBoard]}
          cb={deleteBoardCb}
        />
      </div>

      {screenWidth() > MIN_SCREEN_WIDTH_PX ?
        <div class="flex flex-col h-screen">
          <PanelGroup direction="row">
            <Panel id="table-div" initialSize={27} minSize={20} collapsible>
              <DbTable parameters={[parameters, setParameters]}></DbTable>
              <DbGauges gauges={[gauges, setGauges]} parameters={[parameters, setParameters]} ></DbGauges>
            </Panel>
            <ResizeHandle />
            <Panel id="chart-div" initialSize={73} minSize={20} collapsible>
              <DbMaps maps={[maps, setMaps]}></DbMaps>
              <DbCharts charts={[charts, setCharts]} parameters={[parameters, setParameters]}></DbCharts>
            </Panel>
          </PanelGroup>
        </div>
        :
        <div class="flex flex-col h-full">
          <div class="flex-grow">
            <DbTable parameters={[parameters, setParameters]}></DbTable>
            <DbGauges gauges={[gauges, setGauges]} parameters={[parameters, setParameters]} ></DbGauges>
            <DbMaps maps={[maps, setMaps]}></DbMaps>
            <DbCharts charts={[charts, setCharts]} parameters={[parameters, setParameters]}></DbCharts>
          </div>
        </div>
      }
    </div >
  );
};

export default Dashboard;
