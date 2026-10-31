import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

const track = mock.fn(async () => {});
mock.module(new URL('../lib/analytics.ts', import.meta.url).href, { namedExports: { track } });

const { recordFeedback } = await import('../lib/feedback.ts');

test('records feedback for a known article', async () => {
  track.mock.resetCalls();
  assert.deepEqual(await recordFeedback('invoices', true, '  Clear steps '), { ok: true });
  assert.equal(track.mock.callCount(), 1);
  assert.deepEqual(track.mock.calls[0].arguments[0], {
    name: 'article_feedback',
    properties: { slug: 'invoices', helpful: true, comment: 'Clear steps' },
  });
});

test('rejects feedback for an unknown article without tracking it', async () => {
  track.mock.resetCalls();
  assert.deepEqual(await recordFeedback('pricing', true), { ok: false, error: 'unknown article' });
  assert.equal(track.mock.callCount(), 0);
});

test('reports a failed analytics call', async () => {
  track.mock.resetCalls();
  track.mock.mockImplementationOnce(async () => {
    throw new Error('collector offline');
  });
  assert.deepEqual(await recordFeedback('reset-password', false), {
    ok: false,
    error: 'could not record feedback',
  });
});
