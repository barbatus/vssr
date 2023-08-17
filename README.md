## Setup

```bash
  npx degit barbatus/vssr my-app-name
```

Development
```bash
  npm run dev
```

Production
```bash
npm run build
npm run serve
```


## Isomorphic Environment
[@tanstack/bling](https://github.com/TanStack/bling) makes it possible to run purely server code in client React hooks or components via Vite transpilation hooks. Hence, one can write server code both in Server Components and in Client ones,
which is then extracted automatically into separate server API endpoints.

This NPM provides a boilerplate to get started with @tanstack/bling as it still requires some patching.

It's worth comparing this approach with tRPC, as the main benefit of both approaches is nearly the same – rapid API bootstrapping with first-class TypeScript support shared across the client and server.
The advantage here is that @tanstack/bling requires much less boilerplate and setup compared to tRPC,
while the disadvantage is that tRPC is currently more mature.

Check out an example project [Botpress](https://github.com/barbatus/assess/blob/main/botpress-bling).

An [example snippet](https://github.com/barbatus/assess/blob/main/botpress-bling/src/pages/Bot/index.tsx#L37) of server code in a component:
```js
  const { data: answers } = useQuery(
    ['chat.answers', queryId], () =>
      server$(async (queryId?: number) => {
        const stories = await prisma.story.findMany({
          where: { queryId },
          include: { answer: true },
        });
        return stories.map((story) => story.answer);
      })(queryId),
    { enabled: !!queryId },
  );
```

### Project structure

The `server` folder contains all the code responsible for setting up an Express server and configuring server-side rendering (SSR).
The `server.ts` file imports the Express app and can be used to add additional routes or middleware.

With the ease of adding API endpoints, it becomes important to create reusable pieces of server code that can be shared across React hooks. You could consider having an `app.ts` file within the `server` or `server/api` folder, containing server API modules.
Meanwhile, you can keep client React hooks in the `hooks` folder.

This separation helps maintain a clear organization and promotes code reusability.
