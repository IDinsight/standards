const reports = new Map([
  [
    'weekly-signups',
    {
      id: 'weekly-signups',
      title: 'Weekly Signups',
      date: '2026-09-21',
      columns: ['region', 'signups', 'note'],
      rows: [
        { region: 'North', signups: 412, note: '' },
        { region: 'South', signups: 388, note: 'Includes "pilot" cohort' },
        { region: 'East, Coastal', signups: 97, note: '' },
      ],
    },
  ],
]);

export function getReport(id) {
  return reports.get(id) ?? null;
}

export function listReports() {
  return [...reports.values()].map(({ id, title, date }) => ({ id, title, date }));
}
