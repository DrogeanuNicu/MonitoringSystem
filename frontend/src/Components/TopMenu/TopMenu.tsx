import { Component } from 'solid-js';
import UserMenu from './UserMenu';
import BoardMenu from './BoardMenu';
import { BoardMenuProps } from './BoardMenu';

interface TopMenuProps {
  username: string;
  boardMenu: BoardMenuProps | undefined;
}

const TopMenu: Component<TopMenuProps> = (props) => {
  return (
    <div class="main-color py-1 shadow-md">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-center md:ml-auto space-y-4 md:space-y-0 md:space-x-4 pr-3">
        <div class="text-white items-center justify-center">
          <a href={`/home/${props.username}`} class="text-2xl font-bold hover:text-gray-300 flex justify-center">Vehicle Monitoring System</a>
        </div>
        <div class="text-white flex items-center">

          {
            props.boardMenu &&
            < div class="md:ml-auto flex space-x-4 items-center pr-3">
              <BoardMenu
                board={props.boardMenu.board}
                editCb={props.boardMenu.editCb}
                otaCb={props.boardMenu.otaCb}
                deleteCb={props.boardMenu.deleteCb}
                downloadCb={props.boardMenu.downloadCb}
              />
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