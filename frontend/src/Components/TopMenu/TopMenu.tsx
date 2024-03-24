import { Component } from 'solid-js';
import MyAccountMenu from "./MyAccountMenu";
import NavBar from './NavBar';

const TopMenu: Component = () => {
  return (
    <div class="main-color py-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white">
          <h1 class="text-lg font-bold">Vehicle Monitoring System</h1>
        </div>
        <div class="text-white flex space-x-4 items-center">
          <NavBar />
          <MyAccountMenu />
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
