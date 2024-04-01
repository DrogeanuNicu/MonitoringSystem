import { Component, onMount, createSignal } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { HiSolidPlusCircle } from "solid-icons/hi";
import { IconButton, Divider, List } from '@suid/material';
import "../Styles/index.css";

import TopMenu from '../Components/TopMenu';
import BoardListItem from '../Components/Board';
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
  const [configMenuBoard, setConfigMenuBoard] = createSignal('');
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
    setConfigMenuBoard('');
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

  const deleteBoardCb = async (boardToBeDeleted: string) => {
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
      <TopMenu username={params.username} boardMenu={undefined} />
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
                deleteCallback={setDeleteDialogBoard} />
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
