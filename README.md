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
Server-side rendering has become increasingly popular in the React world, especially with the introduction of Server Components in React.
While Server Components are beneficial and can significantly improve vital rendering metrics, while allowing to access purely server-side code, such as accessing a database, within components. JavaScript can run on both the client and server; what if we blurred the line between server and client components, enabling the writing of server code within client components as well?

Here we go, [@tanstack/bling](https://github.com/TanStack/bling) powered by Vite transpilation. It enables writing server code within a client hook or even integrating it into a component, which is then extracted automatically into a separate server API endpoint.

It's worth comparing this approach with tRPC, as the main benefit of both approaches is nearly the same – rapid bootstrapping with first-class TypeScript support shared across the client and server.
The advantage here is that it requires much less boilerplate and setup compared to tRPC,
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
