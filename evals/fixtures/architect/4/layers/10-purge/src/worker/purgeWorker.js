export function startPurgeWorker({ bus, store, logger }) {
  bus.subscribe('exports.purge', async (message) => {
    const removed = store.purgeBefore(message.payload.olderThan);
    logger.info('expired exports purged', { removed, messageId: message.id });
  });
}
