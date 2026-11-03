export function startExportWorker({ bus, store, reports, notifier, logger }) {
  bus.subscribe('export.requested', async (message) => {
    const { exportId, report, callbackUrl } = message.payload;
    const log = logger.child({ exportId, messageId: message.id });
    store.update(exportId, { status: 'running' });
    log.info('export started', { report });

    let outcome;
    try {
      const rows = await reports.build(report);
      outcome = { status: 'done', rowCount: rows.length };
      log.info('export finished', { rowCount: rows.length });
    } catch (error) {
      outcome = { status: 'failed', error: error.message };
      log.error('export failed', { error: error.message });
    }

    store.update(exportId, outcome);
    await notifier.notify(callbackUrl, { exportId, ...outcome });
  });
}
