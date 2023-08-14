import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { addSerializer } from '@tanstack/bling/client';

import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';

import { App } from './app';

import './global.css';

addSerializer({
  apply: (req) => req instanceof Request,
  serialize: (value) => '$request',
});

const queryClient = new QueryClient();

declare global {
  interface Window { __REACT_QUERY_STATE__: string; }
}

const dehydratedState = window.__REACT_QUERY_STATE__;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <App />
        </Hydrate>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
