import { Component } from 'solid-js';

const NavBar: Component = () => {
  return (
    <ul class="flex space-x-4">
      <li>
        <a href="#" class="hover:text-gray-300">Home</a>
      </li>
    </ul>
  );
};

export default NavBar;