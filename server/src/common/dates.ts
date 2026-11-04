export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
}

/** Client dates are local calendar days, so allow one day either side of UTC. */
export function isPlausibleClientDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const today = toDateString(new Date());
  return date >= addDays(today, -1) && date <= addDays(today, 1);
}
