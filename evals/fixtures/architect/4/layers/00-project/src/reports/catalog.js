const REPORTS = {
  'monthly-usage': () => [
    { month: '2026-08', requests: 1204 },
    { month: '2026-09', requests: 1391 },
  ],
  'active-accounts': () => [
    { account: 'acme', seats: 12 },
    { account: 'globex', seats: 4 },
    { account: 'initech', seats: 7 },
  ],
};

export function createReportCatalog() {
  return {
    async build(name) {
      const report = REPORTS[name];
      if (!report) throw new Error(`unknown report: ${name}`);
      return report();
    },
  };
}
