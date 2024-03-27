import { Component, createSignal } from 'solid-js';

import { IconButton, Menu, MenuItem } from "@suid/material";
import { HiOutlineUserCircle } from "solid-icons/hi";

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
      >{props.username}
        <HiOutlineUserCircle size={48} color="white" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl()}
        open={open()}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "user-menu-button" }}
      >
        <MenuItem onClick={handleClose} divider={true}>Settings</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

export type { UserMenuProps };
export default UserMenu;