export const OFFICES = [
  { code: 'LDN', name: 'London office', timezone: 'Europe/London' },
  { code: 'NBO', name: 'Nairobi office', timezone: 'Africa/Nairobi' },
  { code: 'DEL', name: 'Delhi office', timezone: 'Asia/Kolkata' },
];

export function createDirectory(records = OFFICES) {
  const byCode = new Map(records.map((record) => [record.code, record]));
  return {
    find(code) {
      return byCode.get(String(code).trim().toUpperCase()) ?? null;
    },
  };
}
