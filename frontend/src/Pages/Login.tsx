import { Component, createSignal } from 'solid-js';
import { useNavigate } from "@solidjs/router";

import FormInputField from "../Components/FormInputField"
import ErrorMessage from '../Components/ErrorMessage';

import "../Styles/index.css";
import { storeToken } from '../Api/Fetch';

const Login: Component = () => {
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [retypedPassword, setRetypedPassword] = createSignal('');
  const [isRegistering, setIsRegistering] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal('');
  const navigate = useNavigate();

  const handleLoginButtonClick = () => {
    setErrorMessage('')
    setIsRegistering(false);
  };

  const handleRegisterButtonClick = () => {
    setErrorMessage('')
    setIsRegistering(true);
  };

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    let url = '';
    const formData = {
      username: username(),
      password: password(),
      email: email(),
    };

    try {
      if (isRegistering()) {
        if (password() !== retypedPassword()) {
          throw new Error('The passwords do not match!');
        }
        url = '/api/register';
      }
      else {
        url = '/api/login';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Could not communicate with the server!');
      }

      const responseData = await response.json();
      if (responseData.error !== undefined) {
        setErrorMessage(responseData.error);
      }
      else {
        // Request was successful, clear the error message
        setErrorMessage('');
        storeToken(formData.username, responseData.token)
        navigate(`/home/${formData.username}`);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    }
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
            <FormInputField
              label="Username"
              type="text"
              minlength="3"
              maxlength="30"
              hasVisibilityToggle={false}
              bind={[username, setUsername]}
            />
            {isRegistering() && (
              <FormInputField
                label="Email"
                type="email"
                minlength="3"
                maxlength="30"
                hasVisibilityToggle={false}
                bind={[email, setEmail]}
              />
            )}
            {/* TODO: Add info message for each field, eg: describe the password pattern */}
            <FormInputField
              label="Password"
              minlength="8"
              maxlength="30"
              hasVisibilityToggle={true}
              bind={[password, setPassword]}
            />
            {isRegistering() && (
              <FormInputField
                label="Retype Password"
                minlength="8"
                maxlength="30"
                hasVisibilityToggle={true}
                bind={[retypedPassword, setRetypedPassword]}
              />
            )}
            <ErrorMessage errorSignalBind={[errorMessage, setErrorMessage]} />
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
