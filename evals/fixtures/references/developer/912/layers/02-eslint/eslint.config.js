import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
  },
];
