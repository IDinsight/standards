// Posts one event to a webhook endpoint. `send` has the shape of fetch().
export async function deliver(event, endpoint, { send } = {}) {
  const body = JSON.stringify({ type: event.type, data: event.data, sentAt: new Date().toISOString() });
  try {
    const response = await send(endpoint.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });
    return { delivered: response.status < 300, status: response.status };
  } catch (error) {
    return { delivered: false, error: error.message };
  }
}
