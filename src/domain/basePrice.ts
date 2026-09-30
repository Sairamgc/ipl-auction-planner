/**
 * Official base-price slabs of the IPL 2026 Player Auction, in lakh
 * (iplt20.com, "TATA IPL 2026 Player Auction list announced": 227, 7, 4,
 * 42, 17, 4, 9 and 40 players respectively; 350 in total).
 */
export const BASE_PRICE_SLABS = [30, 40, 50, 75, 100, 125, 150, 200] as const;

/**
 * Slabs selectable as a minimum, given a chosen maximum (and vice versa),
 * so the range can never be inverted.
 */
export function minBaseOptions(maxBase: number | undefined): number[] {
  return BASE_PRICE_SLABS.filter(
    (slab) => maxBase === undefined || slab <= maxBase,
  );
}

export function maxBaseOptions(minBase: number | undefined): number[] {
  return BASE_PRICE_SLABS.filter(
    (slab) => minBase === undefined || slab >= minBase,
  );
}
