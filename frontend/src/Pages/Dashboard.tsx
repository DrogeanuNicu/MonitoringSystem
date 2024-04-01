import { Component, onMount, createSignal } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";

import TopMenu from '../Components/TopMenu';
import ConfigMenuDialog from '../Components/Dialogs/ConfigMenuDialog';
import ErrorMessageDialog from '../Components/Dialogs/ErrorMessageDialog';
import DeleteBoardDialog from '../Components/Dialogs/DeleteBoardDialog';
import { BoardConfig, getBoardConfig, editBoardApi, deleteBoardApi, downloadBoardDataApi, otaUpdateApi } from '../Api/Board';

const Dashboard: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [errorDialog, setErrorDialog] = createSignal('');
  const [deleteDialogBoard, setDeleteDialogBoard] = createSignal('');
  const [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  const [configMenuBoard, setConfigMenuBoard] = createSignal('');

  const prepareEditBoard = (board: string) => {
    setConfigMenuBoard(board);
    setIsConfigMenuOn(true);
  }

  const editBoard = async (newConfig: BoardConfig, oldBoardName: string) => {
    await editBoardApi(params.username, newConfig, oldBoardName);
    navigate(`/dashboard/${params.username}/${newConfig.board}`)
  };

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

  const configMenuCallback = async (newConfig: BoardConfig, oldBoardName?: string | undefined) => {
    if (oldBoardName !== undefined) {
      await editBoard(newConfig, oldBoardName);
    } else {
      throw new Error("the board you are trying to edit does not exist anymore!");
    }
  }

  const generate = async () => {
    try {
      const config: BoardConfig = await getBoardConfig(params.username, params.board);
      console.log(config);
    } catch (error: any) {
      setErrorDialog(error.message);
    }
  }

  onMount(generate);

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
        <ConfigMenuDialog
          username={params.username}
          board={configMenuBoard()}
          cb={configMenuCallback}
          show={[isConfigMenuOn, setIsConfigMenuOn]}>
        </ConfigMenuDialog>
      }
      <ErrorMessageDialog errorMsg={[errorDialog, setErrorDialog]} />
      <DeleteBoardDialog
        username={params.username}
        board={[deleteDialogBoard, setDeleteDialogBoard]}
        cb={deleteBoardCb}
      />

      <p>Dashboard page for user {params.username}, board {params.board}</p>
    </div>
  );
};

export default Dashboard;
