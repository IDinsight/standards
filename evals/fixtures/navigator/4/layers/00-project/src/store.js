export function createStore() {
  const reminders = new Map();
  let nextId = 1;

  return {
    add({ to, text, dueAt }) {
      const reminder = { id: nextId++, to, text, dueAt, sentAt: null };
      reminders.set(reminder.id, reminder);
      return { ...reminder };
    },
    get(id) {
      const reminder = reminders.get(id);
      return reminder ? { ...reminder } : null;
    },
    list() {
      return [...reminders.values()].map((reminder) => ({ ...reminder }));
    },
    due(now, limit) {
      return [...reminders.values()]
        .filter((reminder) => reminder.sentAt === null && reminder.dueAt <= now)
        .sort((a, b) => a.dueAt - b.dueAt)
        .slice(0, limit)
        .map((reminder) => ({ ...reminder }));
    },
    markSent(id, at) {
      const reminder = reminders.get(id);
      if (reminder) reminder.sentAt = at;
    },
  };
}
