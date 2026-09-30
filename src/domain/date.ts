const displayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** `2025-12-16` → `16 Dec 2025`. Calendar dates are read as UTC. */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Expected YYYY-MM-DD, got "${isoDate}"`);
  }
  return displayFormat.format(date);
}
