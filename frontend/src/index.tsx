/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from "@solidjs/router";

import './styles/index.css';
import Login from './pages/login';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found.',
  );
}

render(
  () => (
    <Router>
      <Route path="/" component={Login} />
    </Router>
  ),
  root!
);