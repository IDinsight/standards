import { renderText } from './render.js';
import { summarizeMonth } from './summary.js';

export function monthlyReport(records, month) {
  return renderText(summarizeMonth(records, month));
}
