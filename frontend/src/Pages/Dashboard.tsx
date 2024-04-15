import { Component, onMount, createSignal, onCleanup } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { PanelGroup, Panel, ResizeHandle } from "solid-resizable-panels";
import "solid-resizable-panels/styles.css";

import TopMenu from '../Components/TopMenu';
import ConfigMenu from '../Components/Dialogs/ConfigMenu';
import ErrorMessage from '../Components/Dialogs/ErrorMessage';
import DeleteBoard from '../Components/Dialogs/DeleteBoard';
import { BoardConfig, loadDataApi, editBoardApi, downloadBoardDataApi, otaUpdateApi } from '../Api/Board';
import { IParameterSignals } from '../Api/Parameter';
import { IChartSignals } from '../Api/Chart';
import { IGaugeSignals } from '../Api/Gauge';
import { IMapSignals } from '../Api/Map';
import { authorizedFetch } from '../Api/Fetch';

const Dashboard: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [errorDialog, setErrorDialog] = createSignal('');
  const [deleteDialogBoard, setDeleteDialogBoard] = createSignal('');
  const [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  const [configMenuBoard, setConfigMenuBoard] = createSignal('');
  const [parameters, setParameters] = createSignal<IParameterSignals[]>([]);
  const [charts, setCharts] = createSignal<IChartSignals[]>([]);
  const [gauges, setGauges] = createSignal<IGaugeSignals[]>([]);
  const [maps, setMaps] = createSignal<IMapSignals[]>([]);

  let intervalId: number;

  const prepareEditBoard = (board: string) => {
    setConfigMenuBoard(board);
    setIsConfigMenuOn(true);
  }

  const prepareDownloadBoardData = async (board: string) => {
    try {
      await downloadBoardDataApi(params.username, board);
    } catch (error: any) {
      setErrorDialog(error.message);
    }
  }

  const prepareOtaUpdate = (board: string) => {
    /* TODO: This should trigger the OTA menu component, the call to the API is performed from there */
    try {
      otaUpdateApi(params.username, board);
    } catch (error: any) {
      console.log(error);
    }
  }

  const deleteBoardCb = async (boardToBeDeleted: string) => {
    navigate(`/home/${params.username}`)
  };

  const configMenuCb = async (newConfig: BoardConfig, oldBoardName?: string | undefined) => {
    if (oldBoardName !== undefined) {
      await editBoardApi(params.username, newConfig, oldBoardName);
      navigate(`/dashboard/${params.username}/${newConfig.Board}`)
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
      const boardData = await response.json();

      console.log(boardData);
      // TODO: Investigate if this makes sense, or if the user should just refresh the page
      setErrorDialog("");
    } catch (error: any) {
      setErrorDialog(error.message);
    }
  }

  const init = async () => {
    try {
      await loadDataApi(
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
      setErrorDialog(error.message);
    }
  }

  const deInit = () => {
    clearInterval(intervalId);
  }

  onMount(init);
  onCleanup(deInit);

  return (
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
      <ErrorMessage errorMsg={[errorDialog, setErrorDialog]} />
      <DeleteBoard
        username={params.username}
        board={[deleteDialogBoard, setDeleteDialogBoard]}
        cb={deleteBoardCb}
      />

      <PanelGroup direction="row">
        <Panel id="table-div" minSize={20}>
          <div class="bg-blue-500">
            <p>table</p>
          </div>
        </Panel>
        <ResizeHandle />
        <Panel id="chart-div" minSize={20}>
          <div class="bg-red-500">
            <p>chart</p>
          </div>
        </Panel>
      </PanelGroup>
    </div >
  );
};

export default Dashboard;
