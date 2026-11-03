import { createWorkerSession } from './api-session.js';
import { runNightlyReport } from './report-job.js';

const api = createWorkerSession({
  baseUrl: process.env.API_URL ?? 'http://localhost:8080',
  username: process.env.WORKER_USERNAME ?? 'report-worker',
  password: process.env.WORKER_PASSWORD,
});
const period = process.env.REPORT_PERIOD ?? new Date().toISOString().slice(0, 7);
const report = await runNightlyReport({ api, period });
console.log(`report ${report.id} for ${period}: ${report.count} expenses`);
