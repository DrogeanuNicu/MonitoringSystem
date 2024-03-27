import { Component } from 'solid-js';

const NotFound: Component = () => {

  return (
    <div>
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 class="text-4xl font-bold text-gray-800">404 Page Not Found!</h1>
        <p class="text-lg text-gray-600 mt-4">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
};

export default NotFound;
