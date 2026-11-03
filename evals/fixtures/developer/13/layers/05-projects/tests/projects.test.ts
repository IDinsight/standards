import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { GET, POST } from '../app/api/projects/route.ts';
import { resetProjects } from '../lib/projects.ts';

beforeEach(() => resetProjects());

function post(body: string): Request {
  return new Request('http://localhost/api/projects', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

test('GET lists the seeded projects', async () => {
  const response = await GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.projects.map((project: { id: string }) => project.id), ['p-1', 'p-2']);
});

test('POST creates a project with the next id', async () => {
  const response = await POST(post(JSON.stringify({ name: ' Data audit ', owner: 'lee' })));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.project.id, 'p-3');
  assert.equal(body.project.name, 'Data audit');
});

test('POST rejects a body that is not JSON', async () => {
  const response = await POST(post('name=x'));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Request body must be JSON' });
});

test('POST rejects a missing owner', async () => {
  const response = await POST(post(JSON.stringify({ name: 'Data audit' })));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'name and owner are required' });
});
