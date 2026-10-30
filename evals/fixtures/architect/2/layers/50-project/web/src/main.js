import { createApiClient } from './api-client.js';

const client = createApiClient({
  baseUrl: document.documentElement.dataset.api,
  onUnauthorized: () => window.location.assign('/login.html'),
});

async function render() {
  const me = await client.restore();
  const expenses = await client.listExpenses();
  document.querySelector('#role').textContent = me.role;
  document.querySelector('#expenses').replaceChildren(...expenses.map((expense) => {
    const item = document.createElement('li');
    item.textContent = `${expense.date} ${expense.category} ${(expense.amountCents / 100).toFixed(2)}`;
    return item;
  }));
}

document.querySelector('#add-expense').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  await client.addExpense({
    amountCents: Math.round(Number(form.get('amount')) * 100),
    category: String(form.get('category')),
    date: String(form.get('date')),
    note: String(form.get('note') ?? ''),
  });
  event.target.reset();
  await render();
});

document.querySelector('#logout').addEventListener('click', async () => {
  await client.logout();
  window.location.assign('/login.html');
});

render().catch(() => {});
