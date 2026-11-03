export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : ""
  const abs = Math.abs(cents)
  const dollars = Math.floor(abs / 100)
  const rest = String(abs % 100).padStart(2, "0")
  return `${sign}$${dollars.toLocaleString("en-US")}.${rest}`
}
