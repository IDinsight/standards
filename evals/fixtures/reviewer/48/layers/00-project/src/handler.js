export function handleLookup(req, { directory }) {
  const code = req.query?.code;
  if (!code) return { status: 400, headers: {}, body: { error: 'code is required' } };
  const office = directory.find(code);
  if (!office) return { status: 404, headers: {}, body: { error: 'office not found' } };
  return { status: 200, headers: {}, body: office };
}
