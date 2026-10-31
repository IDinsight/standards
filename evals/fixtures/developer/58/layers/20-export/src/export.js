import { csvLine } from './csv.js';

const COLUMNS = ['date', 'site', 'participant', 'present', 'notes'];

function row(record) {
  return [record.date, record.site, record.participant, record.present ? 'yes' : 'no', record.notes];
}

// Returns the attendance records as CSV text with CRLF line endings.
export function exportAttendance(records) {
  const lines = [COLUMNS, ...records.map(row)].map(csvLine);
  return `${lines.join('\r\n')}\r\n`;
}
