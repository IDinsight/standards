import { createImport, getImport, type ImportJob } from './api.ts';

export function importRows(jobs: ImportJob[]): { id: string; text: string }[] {
  return jobs
    .filter((job) => job.status === 'done')
    .map((job) => ({ id: job.id, text: `Imported: ${new Date(job.created_at).toLocaleString()}` }));
}

function token(): string {
  const value = sessionStorage.getItem('datahub.token') ?? window.prompt('API token') ?? '';
  sessionStorage.setItem('datahub.token', value);
  return value;
}

export function mountImportsPage(root: HTMLElement): void {
  root.innerHTML = `<h1>Imports</h1>
    <form><input type="file" accept=".csv" required /><button type="submit">Upload</button></form>
    <ul class="imports"></ul>`;
  const form = root.querySelector('form')!;
  const list = root.querySelector('ul')!;
  const jobs: ImportJob[] = [];
  const render = () =>
    list.replaceChildren(...importRows(jobs).map((row) => Object.assign(document.createElement('li'), { textContent: row.text })));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = form.querySelector('input')!.files?.[0];
    if (!file) return;
    jobs.unshift(await createImport(file));
    render();
  });
  setInterval(async () => {
    for (const [index, job] of jobs.entries()) {
      if (job.status === 'running') jobs[index] = await getImport(job.id, token());
    }
    render();
  }, 2000);
}
