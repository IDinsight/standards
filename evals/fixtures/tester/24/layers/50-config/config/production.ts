import type { AppOptions } from '../src/app.ts';

// Settings for the deployed records service. src/main.ts builds the
// production app from them, and the integration tests start the app with the
// same settings.
export const production: AppOptions = {
  routes: ['records'],
  exportDir: '/var/lib/records-admin/exports',
};
