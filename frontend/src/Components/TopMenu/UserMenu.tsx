import { Component, createSignal } from 'solid-js';

import { IconButton, Menu, MenuItem } from "@suid/material";
import { HiOutlineUserCircle, HiSolidCog8Tooth, HiSolidArrowLeftOnRectangle } from "solid-icons/hi";

interface UserMenuProps {
  username: string;
}

const UserMenu: Component<UserMenuProps> = (props) => {
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
        <p class='pr-1'>{props.username}</p>
        <HiOutlineUserCircle size={40} color="white" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "user-menu-button" }}
      >
        <MenuItem onClick={handleClose} divider={true}>
          <span class="pr-4">Settings</span>
          <HiSolidCog8Tooth size={32} class="icon-main-color ml-auto" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <span class="pr-4">Logout</span>
          <HiSolidArrowLeftOnRectangle size={32} class="icon-main-color ml-auto" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export type { UserMenuProps };
export default UserMenu;