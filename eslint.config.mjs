// ESLint's recommended rules for the repository's JavaScript. All of it runs
// on Node.js: the CLI, the installed runtime tools, the tests, and the docs
// build scripts.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  // Docs build output, Astro's generated cache, local evaluation results, and
  // the eval harness's data: fixtures and runs (synthetic projects, not this
  // repository's code), including the harness's sample and self-test fixtures.
  globalIgnores(['docs/dist/', 'docs/.astro/', 'results/', 'evals/fixtures/', 'evals/runs/', 'evals/judge-checks/',
    'evals/harness/samples/', 'evals/harness/selftest/*/layers/']),
  js.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
]);
