export function search(records, query) {
  return records.filter((record) => record.title.includes(query));
}
