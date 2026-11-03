export function normalizeContact(body) {
  return {
    name: body.name.trim().replace(/\s+/g, ' '),
    email: body.email.trim().toLowerCase(),
    phone: body.phone ? body.phone.replace(/[^\d+]/g, '') : null,
  };
}
