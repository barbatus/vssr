import { createApp } from './ssr';

const app = await createApp();

console.log('Listening on http://localhost:5173');
app.listen(5173);
