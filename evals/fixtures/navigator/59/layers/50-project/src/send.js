export async function sendMessage(transport, message) {
  const response = await transport.send(message);
  if (response.status >= 300) {
    throw new Error('send failed with status ' + response.status);
  }
  return response;
}
