/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from "@solidjs/router";

import Login from './Pages/Login';
import Home from './Pages/Home';
import NotFound from './Pages/NotFound';

import './Styles/index.css';

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
      <Route path="/home/:username" component={Home} />
      <Route path="*" component={NotFound} />
    </Router>
  ),
  root!
);