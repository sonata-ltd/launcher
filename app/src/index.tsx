/* @refresh reload */
import { render } from 'solid-js/web';
import { HashRouter, MemoryRouter, Router } from "@solidjs/router";

import './index.css';
import { ChildrenReturn, Component, lazy } from 'solid-js';
import App from '@/App.tsx';
import { routes } from './routes';


const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}


render(() => (
    <Router root={App}>{routes}</Router>
), root!);
