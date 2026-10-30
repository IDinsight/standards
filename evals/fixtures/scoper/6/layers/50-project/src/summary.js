import { attachmentName, contentDisposition } from './http/attachment.js';

export function summarize(report) {
  const totals = {};
  for (const column of report.columns) {
    const values = report.rows.map((row) => row[column]);
    if (values.every((value) => typeof value === 'number')) {
      totals[column] = values.reduce((sum, value) => sum + value, 0);
    }
  }
  return { id: report.id, title: report.title, date: report.date, rowCount: report.rows.length, totals };
}

export function summaryDownload(report) {
  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': contentDisposition(attachmentName(report, 'json')),
    },
    body: JSON.stringify(summarize(report), null, 2),
  };
}
