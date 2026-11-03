export function createResponseStore() {
  const responses = [];
  return {
    add(response) {
      if (!response.surveyId) throw new Error('surveyId is required');
      const record = {
        id: responses.length + 1,
        surveyId: response.surveyId,
        submittedAt: response.submittedAt ?? new Date().toISOString(),
        answers: { ...response.answers },
      };
      responses.push(record);
      return record;
    },
    forSurvey(surveyId) {
      return responses.filter((record) => record.surveyId === surveyId);
    },
  };
}
