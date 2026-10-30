export function validateBookmark(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return ['body must be a JSON object'];
  const problems = [];
  if (typeof input.url !== 'string' || !/^https?:\/\//.test(input.url)) {
    problems.push('url must start with http:// or https://');
  }
  if (typeof input.title !== 'string' || input.title.trim() === '') {
    problems.push('title is required');
  }
  if (input.tags !== undefined && (!Array.isArray(input.tags) || input.tags.some((tag) => typeof tag !== 'string'))) {
    problems.push('tags must be a list of strings');
  }
  return problems;
}
