import { Component, onMount, createSignal } from 'solid-js';
import { useParams } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";


import TopMenu from '../../Components/TopMenu/TopMenu';

import "../../Styles/index.css";
import { authorizedFetch } from '../../Api/Fetch';


const Home: Component = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = createSignal(false);

  const fetchData = async () => {
    try {
      const response = await authorizedFetch(params.username, `/api/home/${params.username}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Your session has expired, please login!');
      }

      const userData = await response.json();
      console.log(userData);

    } catch (error) {
      /*TODO: print something to the user, this should be in the login page */
      navigate(`/`);
    }
  };

  onMount(fetchData);

  const showMenu = () => {
    setShowDropdown(true);
  };

  const hideMenu = () => {
    setShowDropdown(false);
  };

  return (
    <div>
      <TopMenu />
      <div class="container mx-auto mt-8">
        <h1>Welcome, {params.username}!</h1>
      </div>
    </div>
  );

};

export default Home;
