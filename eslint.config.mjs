// ESLint's recommended rules for the repository's JavaScript. All of it runs
// on Node.js: the CLI, the installed runtime tools, the tests, and the docs
// build scripts.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  // Docs build output, Astro's generated cache, and local evaluation results.
  globalIgnores(['docs/dist/', 'docs/.astro/', 'results/']),
  js.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
]);
