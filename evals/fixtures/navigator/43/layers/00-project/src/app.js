import { validate } from './observations.js';

export async function recordObservation({ store, client }, input) {
  const observation = validate(input);
  const saved = await client.postObservation(observation);
  return store.add(saved);
}

export function listObservations({ store }) {
  return store.list();
}
