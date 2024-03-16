import { Component, createSignal } from 'solid-js';
import { A } from "@solidjs/router";
import "../../styles/index.css"; // Import your CSS file

const Login: Component = () => {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isRegistering, setIsRegistering] = createSignal(false); // Track whether registering or logging in
  const [showPassword, setShowPassword] = createSignal(false); // Track whether to show password

  const handleLoginButtonClick = () => {
    setIsRegistering(false);
  };

  const handleRegisterButtonClick = () => {
    setIsRegistering(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isRegistering()) {
      // Handle registration form submit
      const formData = {
        email: email(),
        password: password()
        // Add other fields as needed
      };
      console.log('Registration Form Data:', formData);
    } else {
      // Handle login form submit
      const formData = {
        email: email(),
        password: password()
      };
      console.log('Login Form Data:', formData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  return (
    <div class="flex justify-center items-center h-screen">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg px-6 py-8">
        <div class="text-center mb-4">
          <div class="flex justify-between mb-4">
            <button
              type="button"
              class={`active-button ${isRegistering() ? 'inactive-button' : ''}`}
              onClick={handleLoginButtonClick}
            >Login</button>
            <button
              type="button"
              class={`active-button ${isRegistering() ? '' : 'inactive-button'}`}
              onClick={handleRegisterButtonClick}
            >Register</button>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div class="mb-2">
              <label class="text-left block mb-1">Email</label>
              <input type="email" onChange={(e) => setEmail(e.target.value)} class="w-full input-field" />
            </div>
            <div class="mb-2">
              <label class="text-left block mb-1">Password</label>
              <div class="relative">
                <input type={showPassword() ? 'text' : 'password'} onChange={(e) => setPassword(e.target.value)} class="w-full input-field pr-10" />
                <button type="button" class="absolute top-0 right-0 mt-2 mr-2" onClick={togglePasswordVisibility}>
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewbox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
                    {showPassword() ? (
                      <path fill="currentColor"
                        d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z">
                      </path>
                    ) : (
                      <path fill="currentColor"
                        d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z">
                      </path>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {isRegistering() && (
              <div class="mb-2">
                <label class="text-left block mb-1">Re-type Password</label>
                <input type="password" class="w-full input-field" />
              </div>
            )}
            <button type="submit" class="submit-button">
              {isRegistering() ? 'Register' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
