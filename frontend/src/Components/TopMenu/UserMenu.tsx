import { Component, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { IconButton, Menu, MenuItem } from "@suid/material";
import { HiOutlineUserCircle, HiSolidCog8Tooth, HiSolidArrowLeftOnRectangle } from "solid-icons/hi";

import { removeToken } from '../../Api/Fetch';
import { authorizedFetch } from '../../Api/Fetch';

interface UserMenuProps {
  username: string;
}

const UserMenu: Component<UserMenuProps> = (props) => {
  const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
  const navigate = useNavigate();

  const open = () => Boolean(anchorEl());

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authorizedFetch(props.username, `/api/${props.username}/logout`, {
      method: 'POST',
    });
    removeToken(props.username);
    navigate("/");
  }

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
        <MenuItem onClick={handleLogout}>
          <span class="pr-4">Logout</span>
          <HiSolidArrowLeftOnRectangle size={32} class="icon-main-color ml-auto" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export type { UserMenuProps };
export default UserMenu;