import { exportRecords, fetchRecords } from './api.js';
import { createExportControl } from './export-control.js';
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

// Offers the CSV as a downloaded file through a temporary link.
function saveFile(fileName, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const exportControl = createExportControl(document, { getFilter: currentFilter, exportRecords, saveFile });
document.getElementById('toolbar').append(exportControl.element);

statusSelect.addEventListener('change', load);
load();
