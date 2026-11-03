import { createApiClient } from './api-client.js';

const client = createApiClient({ baseUrl: document.documentElement.dataset.api });
const form = document.querySelector('#login');
const message = document.querySelector('#message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  try {
    await client.login(String(data.get('username')), String(data.get('password')));
    window.location.assign('/');
  } catch (error) {
    message.textContent = error.status === 429 ? 'Too many attempts. Try again later.' : 'Sign-in failed.';
  }
});
