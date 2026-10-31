const NEEDS_QUOTES = /[",\r\n]/;

function cell(value) {
  const text = value == null ? '' : String(value);
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function exportSurveyCsv(store, surveyId, questions) {
  const header = ['response_id', 'submitted_at', ...questions];
  const records = store.forSurvey(surveyId).map((response) =>
    [response.id, response.submittedAt, ...questions.map((question) => response.answers[question])]
      .map(cell)
      .join(','));
  return [header.map(cell).join(','), ...records].map((line) => `${line}\r\n`).join('');
}
