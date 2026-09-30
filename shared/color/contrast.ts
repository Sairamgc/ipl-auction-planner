/** WCAG 2.x contrast ratio between two `#RRGGBB` colours (1 to 21). */
export function contrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA minimum for normal-size text. */
export const MIN_TEXT_CONTRAST = 4.5;

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const [r, g, b] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
