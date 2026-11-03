export class ObservationStore {
  constructor() {
    this.items = [];
  }

  add(observation) {
    this.items.push(observation);
    return observation;
  }

  list() {
    return [...this.items];
  }
}

export function validate(input) {
  const { site, species, count, note = '' } = input;
  if (!site || !species) throw new Error('site and species are required');
  if (!Number.isInteger(count) || count < 0) throw new Error('count must be a non-negative integer');
  return { site: String(site).trim(), species: String(species).trim(), count, note: String(note) };
}
