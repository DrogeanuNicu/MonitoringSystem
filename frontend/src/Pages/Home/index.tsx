import { Component } from 'solid-js';
import { useParams } from "@solidjs/router";

import "../../Styles/index.css";

const Home: Component = () => {
  const params = useParams();

  return (
    <div>
      <h1>Welcome, {params.username}!</h1>
    </div>
  );
};

export default Home;
