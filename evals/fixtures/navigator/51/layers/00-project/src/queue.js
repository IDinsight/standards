// In-memory job queue used by the worker loop.
export class JobQueue {
  #items = [];

  get size() {
    return this.#items.length;
  }

  enqueue(job) {
    if (typeof job?.run !== 'function') throw new TypeError('job.run must be a function');
    this.#items.push(job);
    this.#siftUp(this.#items.length - 1);
  }

  dequeue() {
    const items = this.#items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  peek() {
    return this.#items[0];
  }

  #before(a, b) {
    return (a.priority ?? 0) > (b.priority ?? 0);
  }

  #siftUp(index) {
    const items = this.#items;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (!this.#before(items[index], items[parent])) break;
      [items[index], items[parent]] = [items[parent], items[index]];
      index = parent;
    }
  }

  #siftDown(index) {
    const items = this.#items;
    for (;;) {
      const left = 2 * index + 1;
      const right = left + 1;
      let best = index;
      if (left < items.length && this.#before(items[left], items[best])) best = left;
      if (right < items.length && this.#before(items[right], items[best])) best = right;
      if (best === index) return;
      [items[index], items[best]] = [items[best], items[index]];
      index = best;
    }
  }
}
