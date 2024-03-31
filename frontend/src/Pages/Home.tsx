import { Component, onMount, createSignal } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { HiSolidPlusCircle } from "solid-icons/hi";
import { IconButton, Divider, List } from '@suid/material';
import "../Styles/index.css";

import TopMenu from '../Components/TopMenu';
import BoardListItem from '../Components/BoardListItem';
import DeleteBoardDialog from '../Components/Dialogs/DeleteBoardDialog';
import ErrorMessageDialog from '../Components/Dialogs/ErrorMessageDialog';
import ConfigMenuDialog from '../Components/Dialogs/ConfigMenuDialog';


import { authorizedFetch } from '../Api/Fetch';
import { BoardConfig, addBoardApi, editBoardApi, deleteBoardApi, downloadBoardDataApi, otaUpdateApi } from '../Api/Board';


const Home: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [errorDialog, setErrorDialog] = createSignal('');
  const [deleteDialogBoard, setDeleteDialogBoard] = createSignal('');
  const [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  const [configMenuBoard, setConfigMenuBoard] = createSignal<string | undefined>();
  const [boardList, setBoardList] = createSignal<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await authorizedFetch(params.username, `/api/${params.username}/boards`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Your session has expired, please login!');
      }

      const userData = await response.json();
      setBoardList(userData.boards);

    } catch (error) {
      /*TODO: print something to the user, this should be in the login page */
      console.log(error);
      navigate(`/`);
    }
  };

  const goToDashboard = (board: string) => {
    navigate(`/dashboard/${params.username}/${board}`);
  }

  const prepareAddBoard = () => {
    setConfigMenuBoard(undefined);
    setIsConfigMenuOn(true);
  }

  const addBoard = async (newConfig: BoardConfig) => {
    if (boardList().includes(newConfig.board)) {
      throw new Error("The name of the board must be unique!")
    }

    await addBoardApi(params.username, newConfig);

    setBoardList(prevList => [...prevList, newConfig.board]);
  };

  const prepareEditBoard = (board: string) => {
    setConfigMenuBoard(board);
    setIsConfigMenuOn(true);
  }

  const editBoard = async (newConfig: BoardConfig, oldBoardName: string) => {
    if (newConfig.board !== oldBoardName) {
      if (boardList().includes(newConfig.board)) {
        throw new Error("The name of the board must be unique!")
      }
    }
    await editBoardApi(params.username, newConfig, oldBoardName);
    setBoardList(prevList => prevList.map(board => board === oldBoardName ? newConfig.board : board));
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

  const prepareDeleteBoard = (boardToBeDeleted: string) => {
    setDeleteDialogBoard(boardToBeDeleted);
  }

  const deleteBoard = async (boardToBeDeleted: string) => {
    await deleteBoardApi(params.username, boardToBeDeleted);
    setBoardList(prevBoardList => prevBoardList.filter(board => board !== boardToBeDeleted));
  };

  const configMenuCallback = async (newConfig: BoardConfig, oldBoardName?: string | undefined) => {
    if (oldBoardName !== undefined) {
      await editBoard(newConfig, oldBoardName);
    } else {
      await addBoard(newConfig);
    }
  }

  onMount(fetchData);

  return (
    <div>
      <TopMenu username={params.username} board='' />
      <ConfigMenuDialog
        username={params.username}
        board={configMenuBoard()}
        callbackFunction={configMenuCallback}
        showBind={[isConfigMenuOn, setIsConfigMenuOn]}>
      </ConfigMenuDialog>
      <ErrorMessageDialog errorMsgBind={[errorDialog, setErrorDialog]} />
      <DeleteBoardDialog showBind={[deleteDialogBoard, setDeleteDialogBoard]} callbackFunction={deleteBoard} />
      <div class="container mx-auto justify-between items-center">
        <div class="flex justify-center items-center mt-8">
          <h1 class="text-2xl text-center text-main-color font-bold">Boards</h1>
        </div>

        <List>
          {boardList().map((board, _) => (
            <>
              <BoardListItem
                board={board}
                dashboardCallback={goToDashboard}
                editCallback={prepareEditBoard}
                otaCallback={prepareOtaUpdate}
                downloadCallback={prepareDownloadBoardData}
                deleteCallback={prepareDeleteBoard} />
              <Divider />
            </>
          ))}
        </List>

        <div class="flex justify-center items-center mt-8">
          <IconButton
            id="add-board-button"
            color="inherit"
            component="span"
            aria-haspopup="true"
            onClick={prepareAddBoard}
          >
            <HiSolidPlusCircle size={48} class="icon-main-color" />
          </IconButton>
        </div>
      </div>
    </div>
  );

};

export default Home;
