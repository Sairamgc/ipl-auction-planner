/**
 * Router search serialisation in the API's own format (UI24): plain
 * strings, lists comma-separated, e.g. `?role=batter,bowler&sort=name`,
 * instead of TanStack Router's default JSON encoding. Route schemas turn
 * the strings back into typed values.
 */
export function parseSearch(search: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(search));
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length > 0) params.set(key, value.map(String).join(","));
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params.set(key, String(value));
    }
  }
  const query = params.toString().replaceAll("%2C", ",");
  return query ? `?${query}` : "";
}
