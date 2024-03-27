import { Component } from 'solid-js';
import UserMenu from './UserMenu';
import { UserMenuProps } from "./UserMenu";

const TopMenu: Component<UserMenuProps> = (props) => {
  return (
    <div class="main-color py-1 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white">
          <a href="#" class="text-2xl font-bold hover:text-gray-300">Vehicle Monitoring System</a>
        </div>
        <div class="text-white flex items-center">
          <div class="md:ml-auto flex space-x-4 items-center">
            <UserMenu username={props.username}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;