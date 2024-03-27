import { Component, onMount, createSignal } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";

import { HiSolidPlusCircle } from "solid-icons/hi";
import { IconButton, Divider, List, Backdrop } from '@suid/material';

import TopMenu from '../Components/TopMenu';
import BoardListItem from '../Components/BoardListItem';
import ConfigMenu from '../Components/ConfigMenu';

import { BoardData } from '../Api/Board';

import "../Styles/index.css";
import { authorizedFetch } from '../Api/Fetch';

const Home: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  let [isConfigMenuOn, setIsConfigMenuOn] = createSignal(false);
  let [configMenuData, setConfigMenuData] = createSignal<BoardData>();
  let [boardList, setBoardList] = createSignal<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await authorizedFetch(params.username, `/api/home/${params.username}/boards`, {
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

  const prepareAddBoard = () => {
    setConfigMenuData(undefined);
    setIsConfigMenuOn(true);
  }

  const addBoard = async (newData: BoardData) => {
    if (boardList().includes(newData.board)) {
      throw new Error("The name of the board must be unique!")
    }

    const response = await authorizedFetch(params.username, `/api/home/${params.username}/add/${newData.board}`, {
      method: 'POST',
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      throw new Error(`Failed to communicate with the server! Status: ${response.status}`);
    }

    const responseData = await response.json();
    if (responseData.error !== undefined) {
      throw new Error (responseData.error);
    }

    setBoardList(prevList => [...prevList, newData.board]);
  };

  const prepareEditBoard = (data: BoardData) => {
    setConfigMenuData(data);
    setIsConfigMenuOn(true);
  }

  const editBoard = (newData: BoardData, oldBoardName: string) => {
    if (newData.board !== oldBoardName) {
      if (boardList().includes(newData.board)) {
        throw new Error("The name of the board must be unique!")
      }
      setBoardList(prevList => prevList.map(board => {
        if (board === oldBoardName) {
          return newData.board;
        }
        return board;
      }));
    }
    /* TODO: Update the data on the server */
  };

  const deleteBoard = (boardToBeDeleted: string) => {

    /* TODO: Delete the board from the database */
    setBoardList(prevBoardList => prevBoardList.filter(board => board !== boardToBeDeleted));
  };

  const configMenuCallback = (newData: BoardData, oldBoardName?: string | undefined) => {
    if (oldBoardName !== undefined) {
      editBoard(newData, oldBoardName);
    } else {
      addBoard(newData);
    }
  }

  onMount(fetchData);

  return (
    <div>
      {
        isConfigMenuOn() &&
        <ConfigMenu data={configMenuData()} callbackFunction={configMenuCallback} hideBind={[isConfigMenuOn, setIsConfigMenuOn]}></ConfigMenu>
      }
      <TopMenu username={params.username} />
      <div class="container mx-auto justify-between items-center">
        <div class="flex justify-center items-center mt-8">
          <h1 class="text-2xl text-center text-main-color font-bold">Boards</h1>
        </div>

        <nav aria-label="boards list">
          <List>
            {boardList().map((board, _) => (
              <>
                <BoardListItem board={board} editHandler={prepareEditBoard} deleteHandler={deleteBoard} />
                <Divider />
              </>
            ))}
          </List>
        </nav>

        <div class="fixed left-1/2 transform -translate-x-1/2 mb-8">
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
