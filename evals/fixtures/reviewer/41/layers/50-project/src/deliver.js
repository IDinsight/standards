export async function deliver(event, { send, config }) {
  let response;
  try {
    response = await send(event, { timeoutMs: config.timeoutMs });
  } catch (error) {
    return { ok: false, attempts: 1, status: 0, error: error.message };
  }
  const ok = response.status >= 200 && response.status < 300;
  return { ok, attempts: 1, status: response.status };
}
