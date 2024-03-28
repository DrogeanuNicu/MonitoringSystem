import { createSignal } from 'solid-js';

import { HiSolidPencil, HiOutlineTrash } from "solid-icons/hi";
import { IoBarChart } from "solid-icons/io";
import { IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@suid/material';

import { BoardData } from '../../Api/Board';

interface BoardListItemProps {
  board: string;
  deleteHandler: (boardToBeDeleted: string) => void;
  editHandler: (boardData: BoardData) => void;
}

const BoardListItem = (props: BoardListItemProps) => {

  const goToDashboard = () => {
    console.log("Go to Dashboard " + props.board);
  };

  const editBoard = () => {
    /* TODO: This component should fetch the data from the server and pass it to the edit handler */
    props.editHandler({ board: props.board });
  }

  return (
    <ListItem disablePadding class="flex items-center">
      <ListItemButton
        onClick={() => goToDashboard()}>
        <ListItemIcon>
          <IoBarChart size={32} class="icon-main-color" />
        </ListItemIcon>
        <ListItemText primary={props.board} class="flex-grow" />
      </ListItemButton>
      <IconButton
        id="add-board-button"
        color="inherit"
        component="span"
        aria-haspopup="true"
        onClick={editBoard}
      >
        <HiSolidPencil size={32} class="icon-main-color" />
      </IconButton>
      <IconButton
        id="add-board-button"
        color="inherit"
        component="span"
        aria-haspopup="true"
        onClick={() => props.deleteHandler(props.board)}
      >
        <HiOutlineTrash size={32} class="icon-main-color" />
      </IconButton>
    </ListItem>
  );
};

export default BoardListItem;
