# Usage

Import `renderNotes` and pass a version plus a list of entries:

```js
import { renderNotes } from './src/render.js';

renderNotes('1.2.0', [{ type: 'added', text: 'JSON output' }]);
```

Each entry has a `type` and a `text`.   Unknown types throw an error.

See [configuration](./configuration.md) for the supported entry types.
