// Renders the records list as a table: a caption with the count, column
// headers, and one row per record.
export function renderRecordsTable(document, records) {
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['ID', 'Title', 'Owner', 'Status', 'Created']) {
    const header = document.createElement('th');
    header.setAttribute('scope', 'col');
    header.textContent = label;
    headRow.append(header);
  }
  head.append(headRow);
  const body = document.createElement('tbody');
  for (const record of records) {
    const row = document.createElement('tr');
    for (const value of [record.id, record.title, record.owner, record.status, record.createdAt.slice(0, 10)]) {
      const cell = document.createElement('td');
      cell.textContent = String(value);
      row.append(cell);
    }
    body.append(row);
  }
  table.append(caption, head, body);
  return table;
}
