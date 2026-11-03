const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function filterSince(visits, since) {
  if (!ISO_DATE.test(since)) throw new Error('Invalid --since date: ' + since);
  return visits.filter((visit) => visit.date > since);
}
