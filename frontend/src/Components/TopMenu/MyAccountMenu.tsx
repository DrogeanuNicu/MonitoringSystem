import { Component, createSignal } from 'solid-js';

const MyAccountMenu: Component = () => {
  const [showDropdown, setShowDropdown] = createSignal(false);

  const toggleMenu = () => {
    setShowDropdown(!showDropdown());
  };

  const hideMenu = () => {
    setShowDropdown(false);
  };

  return (
    <div class="relative">
      <button onClick={toggleMenu} class="text-white hover:text-gray-300 focus:outline-none">
        My Account
      </button>
      {showDropdown() && (
        <div class="absolute right-0 mt-2 rounded shadow-md bg-white border border-gray-200">
          <div class="absolute top-full right-3 -mt-2 w-0 h-0 border-t border-gray-200 border-solid border-2"></div>
          <a href="#" class="block px-4 py-2 hover:bg-gray-100">Settings</a>
          <a href="#" class="block px-4 py-2 hover:bg-gray-100">Logout</a>
        </div>
      )}
    </div>
  );
};

export default MyAccountMenu;
