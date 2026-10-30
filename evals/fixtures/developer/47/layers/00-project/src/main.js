import { items } from './items.js';
import { renderTable, renderToolbar } from './render.js';

const app = document.querySelector('#app');
app.innerHTML = renderToolbar() + renderTable(items);
