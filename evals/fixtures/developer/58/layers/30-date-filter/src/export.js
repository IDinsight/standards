import { csvLine } from './csv.js';

const COLUMNS = ['date', 'site', 'participant', 'present', 'notes'];

function row(record) {
  return [record.date, record.site, record.participant, record.present ? 'yes' : 'no', record.notes];
}

// Dates are ISO YYYY-MM-DD strings, so string comparison is chronological.
function inRange(record, from, to) {
  return (!from || record.date >= from) && (!to || record.date <= to);
}

// Returns the selected attendance records as CSV text with CRLF line endings.
export function exportAttendance(records, { from, to } = {}) {
  const selected = records.filter((record) => inRange(record, from, to));
  const lines = [COLUMNS, ...selected.map(row)].map(csvLine);
  return `${lines.join('\r\n')}\r\n`;
}
