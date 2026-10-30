import { randomUUID } from 'node:crypto';

// In-process message bus. Messages are delivered asynchronously, in publish
// order, to every handler subscribed to their topic.
export class MemoryBus {
  constructor({ logger }) {
    this.logger = logger;
    this.handlers = new Map();
    this.queue = [];
    this.running = null;
  }

  subscribe(topic, handler) {
    const list = this.handlers.get(topic) ?? [];
    list.push(handler);
    this.handlers.set(topic, list);
  }

  publish(topic, payload, headers = {}) {
    const message = { id: randomUUID(), topic, headers: { ...headers }, payload, publishedAt: new Date().toISOString() };
    this.queue.push(message);
    this.logger.info('message published', { topic, messageId: message.id });
    if (!this.running) this.running = this.#deliver();
    return message.id;
  }

  // Resolves once every queued message has been handled.
  async idle() {
    while (this.running) await this.running;
  }

  async #deliver() {
    await new Promise((resolve) => setImmediate(resolve));
    while (this.queue.length) {
      const message = this.queue.shift();
      for (const handler of this.handlers.get(message.topic) ?? []) {
        try {
          await handler(message);
        } catch (error) {
          this.logger.error('message handler failed', { topic: message.topic, messageId: message.id, error: error.message });
        }
      }
    }
    this.running = null;
  }
}
