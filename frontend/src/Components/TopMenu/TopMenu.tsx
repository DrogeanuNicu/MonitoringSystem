import { Component } from 'solid-js';
import UserMenu from './UserMenu';
import BoardMenu from './BoardMenu';

interface TopMenuProps {
  username: string;
  board: string | undefined;
}


const TopMenu: Component<TopMenuProps> = (props) => {
  return (
    <div class="main-color py-1 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white">
          <a href={`/home/${props.username}`} class="text-2xl font-bold hover:text-gray-300">Vehicle Monitoring System</a>
        </div>
        <div class="text-white flex items-center">

          {
            props.board &&
            < div class="md:ml-auto flex space-x-4 items-center pr-3">
              <BoardMenu board={props.board} />
            </div>
          }

          <div class="md:ml-auto flex space-x-4 items-center">
            <UserMenu username={props.username} />
          </div>
        </div>
      </div>
    </div >
  );
};

export default TopMenu;