import '@solid-devtools/debugger/setup';
/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import { ChildrenReturn, Component, lazy } from 'solid-js';
import App from './App.tsx';
import { routeNames, routes } from './routes';

import { LocalRouterProvider } from 'lib/localRouter';
import { LoggerProvider } from 'lib/logger';
import 'solid-devtools';



const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const getRouteByName = (name: string) => {
    return routes.find(route => route.path === name);
};


render(() => (
    <LoggerProvider>
        <LocalRouterProvider>
            <App />
        </LocalRouterProvider>
    </LoggerProvider>
), root!);
