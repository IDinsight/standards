# textkit

Small text helpers used by our publishing tools.

## slugify(input)

Turns a title into a URL slug: lowercase ASCII letters and digits separated by
single hyphens. Accents are removed and leading or trailing separators are
dropped.

```js
import { slugify } from './src/slug.js';

slugify("Café au lait, s'il vous plaît"); // 'cafe-au-lait-s-il-vous-plait'
```

## Tests

```sh
npm test
```
