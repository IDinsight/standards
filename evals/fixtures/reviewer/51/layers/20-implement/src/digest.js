import { daysOverdue } from './loans.js';
import { queueMessage } from './mailer.js';

export function buildDigests(loans, today) {
  const groups = new Map();
  for (const loan of loans) {
    const days = daysOverdue(loan, today);
    if (days <= 0) continue;
    const email = loan.borrower.email.trim();
    const key = email.toLowerCase();
    if (!groups.has(key)) groups.set(key, { key, email, name: loan.borrower.name, items: [] });
    groups.get(key).items.push({ title: loan.title, days });
  }
  return [...groups.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ email, name, items }) => ({
      email,
      name,
      items: items.sort((a, b) => b.days - a.days || a.title.localeCompare(b.title)),
    }));
}

function renderBody(digest) {
  const lines = digest.items.map(({ title, days }) => `- ${title} (${days} ${days === 1 ? 'day' : 'days'} overdue)`);
  return `Hello ${digest.name},\n\n${lines.join('\n')}\n\nPlease return or renew these items at your earliest convenience.\n`;
}

export function queueOverdueDigests(loans, today, outbox) {
  const digests = buildDigests(loans, today);
  for (const digest of digests) {
    queueMessage(outbox, {
      to: digest.email,
      subject: `Overdue items: ${digest.items.length}`,
      body: renderBody(digest),
    });
  }
  return digests.length;
}
