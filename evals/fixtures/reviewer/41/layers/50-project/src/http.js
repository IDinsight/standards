// Production sender: POST the event as JSON. A timeout or network error
// rejects, which deliver() reports as status 0.
export function httpSender(url) {
  return async (event, { timeoutMs }) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { status: response.status };
  };
}
