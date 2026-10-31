export function countAnswers(responses, question) {
  const counts = {};
  for (const response of responses) {
    const answer = response.answers[question];
    if (answer === undefined) continue;
    counts[answer] = (counts[answer] ?? 0) + 1;
  }
  return counts;
}
