const LAKH_PER_CRORE = 100;
/** U+2212, the typographic minus sign. */
const MINUS = "−";

/**
 * Formats whole lakh for display (D12, D14): ₹1 Cr and above in crore with
 * two decimals (`₹2.40 Cr`), below that in whole lakh (`₹75 L`), negatives
 * with a minus sign (`−₹1.20 Cr`).
 */
export function formatLakh(lakh: number): string {
  const magnitude = formatMagnitude(lakh);
  return lakh < 0 ? `${MINUS}${magnitude}` : magnitude;
}

/**
 * Accessible text for an amount: the same as `formatLakh`, but a negative
 * amount reads "minus …" so screen readers announce the sign (D14).
 */
export function formatLakhLabel(lakh: number): string {
  const magnitude = formatMagnitude(lakh);
  return lakh < 0 ? `minus ${magnitude}` : magnitude;
}

function formatMagnitude(lakh: number): string {
  if (!Number.isInteger(lakh)) {
    throw new RangeError(`Money must be whole lakh, got ${String(lakh)}`);
  }
  const absolute = Math.abs(lakh);
  return absolute >= LAKH_PER_CRORE
    ? `₹${(absolute / LAKH_PER_CRORE).toFixed(2)} Cr`
    : `₹${String(absolute)} L`;
}
