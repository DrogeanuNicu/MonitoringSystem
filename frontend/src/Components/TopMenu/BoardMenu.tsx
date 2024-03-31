import { Component, createSignal } from 'solid-js';

import { IconButton, Menu, MenuItem } from "@suid/material";
import { HiOutlineCpuChip, HiSolidPencil, HiOutlineTrash, HiSolidArrowDownTray, HiSolidArrowUpTray } from "solid-icons/hi";

interface BoardMenuProps {
  board: string | undefined;
}

const BoardMenu: Component<BoardMenuProps> = (props) => {
  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);

  const open = () => Boolean(anchorEl());

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        id="user-menu-button"
        color="inherit"
        component="span"
        aria-controls={open() ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open() ? "true" : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <p class='pr-1'>{props.board}</p>
        <HiOutlineCpuChip size={40} color="white" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "user-menu-button" }}
      >
        <MenuItem onClick={handleClose} divider={true}>
          <span class="pr-4">Edit</span>
          <HiSolidPencil size={32} class="icon-main-color ml-auto" />
        </MenuItem>
        <MenuItem onClick={handleClose} divider={true}>
          <span class="pr-4">OTA Update</span>
          <HiSolidArrowUpTray size={32} class="icon-main-color ml-auto" />
        </MenuItem>
        <MenuItem onClick={handleClose} divider={true}>
          <span class="pr-4">Download</span>
          <HiSolidArrowDownTray size={32} class="icon-main-color ml-auto" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <span class="pr-4">Delete</span>
          <HiOutlineTrash size={32} class="icon-main-color ml-auto" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export type { BoardMenuProps };
export default BoardMenu;