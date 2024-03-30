import { createSignal } from 'solid-js';

import { HiSolidPencil, HiOutlineTrash, HiSolidArrowDownTray, HiSolidArrowUpTray } from "solid-icons/hi";
import { IoBarChart } from "solid-icons/io";
import { IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@suid/material';
import { downloadBoardDataApi } from '../../Api/Board';

interface BoardListItemProps {
  board: string;
  editCallback: (board: string) => void;
  otaCallback: (board: string) => void;
  deleteCallback: (boardToBeDeleted: string) => void;
  downloadCallback: (board: string) => void;
}

const BoardListItem = (props: BoardListItemProps) => {

  const goToDashboard = () => {
    console.log("Go to Dashboard " + props.board);
  };

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
        onClick={() => props.editCallback(props.board)}
      >
        <HiSolidPencil size={32} class="icon-main-color" />
      </IconButton>

      <IconButton
        id="ota-board-button"
        color="inherit"
        component="span"
        aria-haspopup="true"
        onClick={() => props.otaCallback(props.board)}
      >
        <HiSolidArrowUpTray size={32} class="icon-main-color" />
      </IconButton>

      <IconButton
        id="download-board-data-button"
        color="inherit"
        component="span"
        aria-haspopup="true"
        onClick={() => props.downloadCallback(props.board)}
      >
        <HiSolidArrowDownTray size={32} class="icon-main-color" />
      </IconButton>

      <IconButton
        id="add-board-button"
        color="inherit"
        component="span"
        aria-haspopup="true"
        onClick={() => props.deleteCallback(props.board)}
      >
        <HiOutlineTrash size={32} class="icon-main-color" />
      </IconButton>
    </ListItem>
  );
};

export default BoardListItem;