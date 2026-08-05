export const STALE_AFTER_DAYS = 365;

const MS_PER_DAY = 86_400_000;

const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

export function verifiedAge(verified: string, today: string): string {
  const days = daysBetween(verified, today);
  if (days <= 0) return 'today';
  if (days < 30) return plural(days, 'day');
  if (days < 365) return plural(Math.floor(days / 30), 'month');
  return plural(Math.floor(days / 365), 'year');
}

export function isStale(verified: string, today: string): boolean {
  return daysBetween(verified, today) > STALE_AFTER_DAYS;
}

/** The rendered verified line, split so the client can rebuild it from `data-verified` alone. */
export function verifiedLine(verified: string, today: string): { label: string; value: string } {
  return isStale(verified, today)
    ? { label: 'unverified since', value: verified }
    : { label: 'verified', value: verifiedAge(verified, today) };
}
