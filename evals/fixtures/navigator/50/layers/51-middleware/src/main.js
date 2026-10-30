import { server } from './server.js';

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`throttle-api listening on ${port}`);
});
