# rotalog

Size-based rotation for application log files. No dependencies; Node.js 22.

```js
import { rotateIfNeeded } from './src/rotate.js';

rotateIfNeeded('logs/app.log');
```

Options and backup naming are described in [docs/guide.md](docs/guide.md).

Run the tests with `npm test`.
