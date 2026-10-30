export async function deliver(send, event) {
  try {
    const response = await send(event);
    return { ok: response.status < 300, status: response.status, attempts: 1 };
  } catch (error) {
    return { ok: false, error: error.message, attempts: 1 };
  }
}
