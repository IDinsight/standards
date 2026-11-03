/**
 * Format a number of minutes as hours and minutes, e.g. `7h 30m`.
 *
 * @param {number} minutes
 * @returns {string}
 */
export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
