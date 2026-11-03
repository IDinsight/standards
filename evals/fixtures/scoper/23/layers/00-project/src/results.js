// Count answers per option for each survey question.
export function summarize(survey, responses) {
  return survey.questions.map((question) => {
    const counts = Object.fromEntries(question.options.map((option) => [option, 0]));
    for (const response of responses) {
      const answer = response.answers[question.id];
      if (answer in counts) counts[answer] += 1;
    }
    return { id: question.id, text: question.text, counts, total: responses.length };
  });
}
