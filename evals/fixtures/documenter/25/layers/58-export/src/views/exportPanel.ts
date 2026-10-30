import type { RecordFilter } from '../records/store.ts';

export type ExportPanelOptions = {
  // URL the panel's form posts to.
  action: string;
  filter: RecordFilter;
  count: number;
};

const FILTER_FIELDS: readonly (keyof RecordFilter)[] = ['status', 'owner', 'q'];

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function summaryText(count: number): string {
  if (count === 0) return 'No records match the current filters.';
  if (count === 1) return '1 record matches the current filters.';
  return `${count} records match the current filters.`;
}

// HTML fragment for the admin tool's export panel; styled by export-panel.css.
export function renderExportPanel(options: ExportPanelOptions): string {
  const fields = FILTER_FIELDS
    .filter((name) => options.filter[name])
    .map((name) => `    <input type="hidden" name="${name}" value="${escapeHtml(String(options.filter[name]))}">`);
  const disabled = options.count === 0 ? ' disabled' : '';
  return [
    '<section class="export-panel" aria-labelledby="export-panel-title">',
    '  <h2 id="export-panel-title" class="export-panel__title">Export records</h2>',
    `  <p id="export-panel-summary" class="export-panel__summary">${summaryText(options.count)}</p>`,
    `  <form class="export-panel__form" method="post" action="${escapeHtml(options.action)}">`,
    ...fields,
    `    <button type="submit" class="export-panel__button" aria-describedby="export-panel-summary"${disabled}>Download CSV</button>`,
    '  </form>',
    '</section>',
    '',
  ].join('\n');
}
