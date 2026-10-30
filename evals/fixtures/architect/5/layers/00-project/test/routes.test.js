import assert from 'node:assert/strict';
import test from 'node:test';

import { Sessions } from '../src/auth.js';
import { createRouter } from '../src/routes.js';
import { ReportStore } from '../src/store.js';
import { Memberships } from '../src/workspaces.js';

function setup() {
  const sessions = new Sessions();
  sessions.issue(10, 'tok-ada');
  sessions.issue(20, 'tok-bo');
  const memberships = new Memberships();
  memberships.add(1, 10);
  memberships.add(2, 20);
  const reports = new ReportStore();
  const report = reports.create({ workspaceId: 1, ownerId: 10, title: 'Q3 revenue', rows: [{ region: 'EU', total: 1200 }] });
  return { handle: createRouter({ sessions, memberships, reports }), report };
}

const as = (token) => ({ authorization: `Bearer ${token}` });

test('requests without a session are rejected', () => {
  const { handle, report } = setup();
  assert.equal(handle({ method: 'GET', path: `/reports/${report.id}` }).status, 401);
  assert.equal(handle({ method: 'GET', path: `/reports/${report.id}`, headers: as('nope') }).status, 401);
});

test('workspace members can read a report', () => {
  const { handle, report } = setup();
  const response = handle({ method: 'GET', path: `/reports/${report.id}`, headers: as('tok-ada') });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.rows, [{ region: 'EU', total: 1200 }]);
});

test('other users get 404 for a report outside their workspace', () => {
  const { handle, report } = setup();
  assert.equal(handle({ method: 'GET', path: `/reports/${report.id}`, headers: as('tok-bo') }).status, 404);
});

test('members can create and list reports', () => {
  const { handle } = setup();
  const created = handle({ method: 'POST', path: '/workspaces/1/reports', headers: as('tok-ada'), body: { title: ' Q3 churn ' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Q3 churn');
  const listed = handle({ method: 'GET', path: '/workspaces/1/reports', headers: as('tok-ada') });
  assert.deepEqual(listed.body.map((item) => item.title), ['Q3 revenue', 'Q3 churn']);
  assert.equal(handle({ method: 'GET', path: '/workspaces/1/reports', headers: as('tok-bo') }).status, 403);
});

test('creating a report requires a title', () => {
  const { handle } = setup();
  const response = handle({ method: 'POST', path: '/workspaces/1/reports', headers: as('tok-ada'), body: { title: '  ' } });
  assert.equal(response.status, 400);
});
