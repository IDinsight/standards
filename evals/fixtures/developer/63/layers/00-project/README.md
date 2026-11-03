# slugkit

Turn arbitrary text into URL-safe slugs.

```js
import { slugify } from 'slugkit';

slugify('Crème Brûlée Recipes'); // 'creme-brulee-recipes'
```

Accents are removed, everything is lowercased, and any run of other characters
becomes a single hyphen. Leading and trailing hyphens are trimmed.

## Development

Run the tests with `npm test`. There are no runtime dependencies.
