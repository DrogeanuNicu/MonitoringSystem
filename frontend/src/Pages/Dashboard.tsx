import { Component, onMount, createSignal, onCleanup } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { PanelGroup, Panel, ResizeHandle } from "solid-resizable-panels";
import "solid-resizable-panels/styles.css";

import TopMenu from '../Components/TopMenu';
import ConfigMenu from '../Components/Dialogs/ConfigMenu';
import ErrorMessage from '../Components/Dialogs/ErrorMessage';
import DeleteBoard from '../Components/Dialogs/DeleteBoard';
import { BoardConfig, loadConfigApi, editBoardApi, downloadBoardDataApi, otaUpdateApi } from '../Api/Board';
import { IParameterSignals } from '../Api/Parameter';
import { IChartSignals } from '../Api/Chart';
import { IGaugeSignals } from '../Api/Gauge';
import { IMapSignals } from '../Api/Map';
import { authorizedFetch } from '../Api/Fetch';
import DbTable from '../Components/Dashboard/Table/DbTable';
import DbCharts from '../Components/Dashboard/Chart/DbCharts';

const Dashboard: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = createSignal('');
  const [deleteDialogBoard, setDeleteDialogBoard] = createSignal('');
  const [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  const [configMenuBoard, setConfigMenuBoard] = createSignal('');
  const [parameters, setParameters] = createSignal<IParameterSignals[]>([]);
  const [charts, setCharts] = createSignal<IChartSignals[]>([]);
  const [gauges, setGauges] = createSignal<IGaugeSignals[]>([]);
  const [maps, setMaps] = createSignal<IMapSignals[]>([]);
  /* TODO: Change this to have the same constants between BE and FE */
  const MAX_ELEMS_PER_CHART: number = 20;

  let intervalId: number;

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
    /* TODO: This should trigger the OTA menu component, the call to the API is performed from there */
    try {
      otaUpdateApi(params.username, board);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  }

  const deleteBoardCb = async (boardToBeDeleted: string) => {
    navigate(`/home/${params.username}`)
  };

  const configMenuCb = async (newConfig: BoardConfig, oldBoardName?: string | undefined) => {
    if (oldBoardName !== undefined) {
      await editBoardApi(params.username, newConfig, oldBoardName);
      await init();
    } else {
      throw new Error("the board you are trying to edit does not exist anymore!");
    }
  }

  const getData = async () => {
    try {
      const response = await authorizedFetch(params.username, `/api/${params.username}/data/${params.board}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Could not communicate with the server! Please refresh!');
      }
      const boardData: string[][] = await response.json();

      if (boardData !== null) {
        if (boardData.length > 0) {
          /* Update table */
          let lastData = boardData[boardData.length - 1]
          for (let i = 0; i < parameters().length && i < lastData.length; i++) {
            parameters()[i].Value[1](lastData[i])
          }

          /* Update charts */
          if (boardData.length !== MAX_ELEMS_PER_CHART) {
            for (let chartIdx = 0; chartIdx < charts().length; chartIdx++) {
              const chart = charts()[chartIdx]?.Ref;
              if (chart !== undefined) {
                chart.data.labels = new Array(boardData.length);
                for (let oyIdx = 0; oyIdx < charts()[chartIdx].Oy.length; oyIdx++) {
                  chart.data.datasets[oyIdx].data = new Array(boardData.length);
                }
              }
            }
          }
          for (let chartIdx = 0; chartIdx < charts().length; chartIdx++) {
            const chart = charts()[chartIdx]?.Ref;
            if (chart !== undefined) {
              for (let set = 0; set < boardData.length; set++) {
                chart.data.labels![set] = boardData[set][charts()[chartIdx].Ox[0]()];
                for (let oyIdx = 0; oyIdx < charts()[chartIdx].Oy[0]().length; oyIdx++) {
                  chart.data.datasets[oyIdx].data[set] = Number(boardData[set][charts()[chartIdx].Oy[0]()[oyIdx].Index[0]()]);
                }
              }

              chart.update();
            }
          }
        }
      }
      // TODO: Investigate if this makes sense, or if the user should just refresh the page
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
        <DeleteBoard
          username={params.username}
          board={[deleteDialogBoard, setDeleteDialogBoard]}
          cb={deleteBoardCb}
        />
      </div>

      <div class="flex flex-col h-screen">
        <PanelGroup direction="row">
          <Panel id="table-div" initialSize={27} minSize={20} collapsible>
            <DbTable parameters={[parameters, setParameters]}></DbTable>
          </Panel>
          <ResizeHandle />
          <Panel id="chart-div" initialSize={73} minSize={20} collapsible>
            <DbCharts charts={[charts, setCharts]} parameters={[parameters, setParameters]}></DbCharts>
          </Panel>
        </PanelGroup>
      </div>
    </div >
  );
};

export default Dashboard;
