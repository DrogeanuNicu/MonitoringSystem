import { Component } from 'solid-js';
import { useParams } from "@solidjs/router";

import TopMenu from '../Components/TopMenu';

const Dashboard: Component = () => {
    const params = useParams();

  return (
    <div>
        <TopMenu username={params.username} board={params.board} />
        <p>Dashboard page for user {params.username}, board {params.board}</p>
    </div>
  );
};

export default Dashboard;
