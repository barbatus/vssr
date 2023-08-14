import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import memoizee from 'memoizee';

import { hasHandler, handleFetch$, addDeserializer } from '@tanstack/bling/server';

import { getRequest, setResponse } from './utils';

const __dirname = path.resolve('.');

addDeserializer({
  apply: (req) => req === '$request',
  deserialize: (value, ctx) => ctx.request,
});

const isProd = process.env.NODE_ENV === 'production';

export async function createApp() {
  const app = express();

  async function buildSSR() {
    const template = fs.readFileSync(path.resolve(__dirname, isProd ? 'dist/client/index.html' : 'index.html'), 'utf-8');
    if (isProd) {
      app.use(
        '/',
        // @ts-ignore
        (await import('serve-static')).default(path.resolve(__dirname, 'dist/client'), {
          index: false,
        }),
      );
      return {
        template,
        render: memoizee(async function(url: string) {
          const render = (await import(path.resolve(__dirname, 'dist/server/entry-server.js'))).render;
          const [appHtml, state] = await render(url);
          return template
            .replace(`<!--ssr-outlet-->`, appHtml)
            .replace(`<!--ssr-state-->`, state);
        }),
        ssrFixStacktrace: () => {},
      }
    }

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Use vite's connect instance as middleware. If you use your own
    // express router (express.Router()), you should use router.use
    app.use(vite.middlewares);

    return {
      template,
      async render(url: string) {
        const template = await vite.transformIndexHtml(url, this.template);
        const [appHtml, state] = await (await vite.ssrLoadModule('/src/entry-server.tsx')).render(url);
        return template
          .replace(`<!--ssr-outlet-->`, appHtml)
          .replace(`<!--ssr-state-->`, state);
      },
      ssrFixStacktrace: (e: Error) => vite.ssrFixStacktrace(e),
    };
  }

  const ssr = await buildSSR();

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      if (hasHandler(url)) {
        const newUrl = new URL(req.originalUrl, `http://${req.headers.host}`);
        const response = await handleFetch$({
          request: await getRequest(newUrl, req),
        });

        if (response) {
          return setResponse(res, response);
        } else {
          return res
            .status(500)
            .set({ 'Content-Type': 'text/html' })
            .end(`API request ${url} failed to produce a response`);
        }
      }

      const html = await ssr.render(url);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      ssr.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
  return app;
}
