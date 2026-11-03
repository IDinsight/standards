// Normalizes rows exported from the coordinators' attendance sheet.
export function parseRecords(rows) {
  return rows.map((row) => ({
    date: row.date,
    site: row.site.trim(),
    participant: row.participant.trim(),
    present: row.present === 'yes',
    notes: row.notes ?? '',
  }));
}
