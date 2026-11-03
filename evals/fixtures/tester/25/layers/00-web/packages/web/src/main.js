import { fetchRecords } from './api.js';
import { renderRecordsTable } from './records-table.js';

const statusSelect = document.getElementById('status-filter');
const results = document.getElementById('results');
const loadError = document.getElementById('load-error');

function currentFilter() {
  return { status: statusSelect.value };
}

async function load() {
  loadError.hidden = true;
  try {
    results.replaceChildren(renderRecordsTable(document, await fetchRecords(currentFilter())));
  } catch (error) {
    results.replaceChildren();
    loadError.textContent = `Could not load records: ${error.message}`;
    loadError.hidden = false;
  }
}

statusSelect.addEventListener('change', load);
load();
