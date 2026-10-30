import assert from 'node:assert/strict';
import test from 'node:test';

import { TaskValidationError } from '../src/errors.js';
import { TaskStore } from '../src/store.js';
import { createTask, updateTask } from '../src/tasks.js';

test('createTask stores tags trimmed, lowercased, and listed once', () => {
  const task = createTask(new TaskStore(), { title: 'a', tags: [' Urgent ', 'home', 'URGENT'] });
  assert.deepEqual(task.tags, ['urgent', 'home']);
});

test('createTask without tags stores an empty list', () => {
  assert.deepEqual(createTask(new TaskStore(), { title: 'a' }).tags, []);
});

test('updateTask replaces tags with the normalized list', () => {
  const store = new TaskStore();
  const { id } = createTask(store, { title: 'a', tags: ['home'] });
  assert.deepEqual(updateTask(store, id, { tags: ['Work', 'work '] }).tags, ['work']);
});

test('updateTask without tags keeps the existing tags', () => {
  const store = new TaskStore();
  const { id } = createTask(store, { title: 'a', tags: ['home'] });
  assert.deepEqual(updateTask(store, id, { status: 'done' }).tags, ['home']);
});

const invalid = [
  ['an empty tag', '   '],
  ['a tag longer than 24 characters', 'x'.repeat(25)],
  ['a tag containing a comma', 'home,work'],
];

for (const [name, tag] of invalid) {
  test('createTask rejects ' + name, () => {
    const store = new TaskStore();
    assert.throws(() => createTask(store, { title: 'a', tags: [tag] }), TaskValidationError);
    assert.deepEqual(store.all(), []);
  });
}

test('a rejected update leaves the task unchanged', () => {
  const store = new TaskStore();
  const { id } = createTask(store, { title: 'a', tags: ['home'] });
  assert.throws(() => updateTask(store, id, { title: 'b', tags: ['ok', ''] }), TaskValidationError);
  assert.deepEqual(store.get(id), { id, title: 'a', status: 'open', tags: ['home'] });
});

test('changing returned tags does not change the stored task', () => {
  const store = new TaskStore();
  const task = createTask(store, { title: 'a', tags: ['home'] });
  task.tags.push('work');
  assert.deepEqual(store.get(task.id).tags, ['home']);
});
