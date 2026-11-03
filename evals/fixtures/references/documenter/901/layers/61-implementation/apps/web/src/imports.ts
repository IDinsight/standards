import { createImport, getImport, type ImportJob } from './api.ts';

const LABELS: Record<string, string> = { pending: 'Waiting', running: 'Importing', failed: 'Failed', done: 'Imported' };

export function importRows(jobs: ImportJob[]): { id: string; status: string; text: string }[] {
  return jobs.map((job) => ({
    id: job.id,
    status: job.status,
    text: `${LABELS[job.status] ?? job.status}: ${
      job.status === 'failed' ? (job.error ?? 'the file could not be imported') : new Date(job.created_at).toLocaleString()
    }`,
  }));
}

function token(): string {
  const value = sessionStorage.getItem('datahub.token') ?? window.prompt('API token') ?? '';
  sessionStorage.setItem('datahub.token', value);
  return value;
}

export function mountImportsPage(root: HTMLElement): void {
  root.innerHTML = `<h1>Imports</h1>
    <form><input type="file" accept=".csv" required /><button type="submit">Upload</button></form>
    <p class="message" role="status"></p>
    <ul class="imports"></ul>`;
  const form = root.querySelector('form')!;
  const message = root.querySelector('p')!;
  const list = root.querySelector('ul')!;
  const jobs: ImportJob[] = [];
  // One key per selected file, so submitting the same selection again reuses its job.
  const keys = new WeakMap<File, string>();
  const render = () =>
    list.replaceChildren(
      ...importRows(jobs).map((row) =>
        Object.assign(document.createElement('li'), { className: `import-${row.status}`, textContent: row.text }),
      ),
    );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = form.querySelector('input')!.files?.[0];
    if (!file) return;
    const key = keys.get(file) ?? crypto.randomUUID();
    keys.set(file, key);
    message.textContent = '';
    try {
      const job = await createImport(file, token(), key);
      const index = jobs.findIndex((existing) => existing.id === job.id);
      if (index >= 0) jobs[index] = job;
      else jobs.unshift(job);
    } catch (error) {
      message.textContent = String(error);
    }
    render();
  });
  setInterval(async () => {
    for (const [index, job] of jobs.entries()) {
      if (job.status === 'pending' || job.status === 'running') jobs[index] = await getImport(job.id, token());
    }
    render();
  }, 2000);
}
