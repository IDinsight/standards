# jobrunner

Instructions for coding agents working in this repository.

- Target Node.js 22 or later and write ES modules (`"type": "module"`).
- Keep production code under `src/` and tests under `test/`.
- Write tests with `node:test` and `node:assert/strict`; list test files explicitly in the `test` script.
- Ask before adding a runtime dependency, and say why it is needed.
- Read configuration from environment variables. Never commit secrets or `.env` files.
