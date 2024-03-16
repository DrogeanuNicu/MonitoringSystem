import { Component, createSignal, createEffect, onCleanup } from 'solid-js';

import styles from './app.module.css';

interface ApiResponse {
  message: string;
}


const App: Component = () => {
  const [data, setData] = createSignal<ApiResponse | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/hello');
      const result: ApiResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  onCleanup(() => {
  });

  createEffect(() => {
    fetchData();
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>{data()?.message}</p>
      </header>
    </div>
  );
};

export default App;
