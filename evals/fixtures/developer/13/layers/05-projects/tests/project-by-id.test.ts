import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { GET } from '../app/api/projects/[id]/route.ts';
import { resetProjects } from '../lib/projects.ts';

beforeEach(() => resetProjects());

const context = (id: string) => ({ params: Promise.resolve({ id }) });
const request = (id: string) => new Request(`http://localhost/api/projects/${id}`);

test('GET returns a single project', async () => {
  const response = await GET(request('p-2'), context('p-2'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.project.name, 'Billing export');
});

test('GET responds 404 for an unknown id', async () => {
  const response = await GET(request('p-9'), context('p-9'));
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Project p-9 not found' });
});
