import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import ssrPrepass from 'react-ssr-prepass';

import { App } from './app';

const queryClient = new QueryClient();

export async function render(url: string) {
  const appElem = (
    <StaticRouter location={url}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StaticRouter>
  );
  await ssrPrepass(appElem).catch(() => {});
  const dehydratedState = dehydrate(queryClient);
  return [ReactDOMServer.renderToString(appElem), `window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydratedState)}`] as const;
}
