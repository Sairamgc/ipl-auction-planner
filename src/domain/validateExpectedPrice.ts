import { formatLakh } from "./money";

export type PriceValidation =
  { ok: true; lakh: number } | { ok: false; error: string };

/**
 * An expected price typed in whole lakh (D2, D10): required, digits only,
 * at least the base price. Above the purse is allowed (warned elsewhere).
 */
export function validateExpectedPrice(
  text: string,
  basePriceLakh: number,
): PriceValidation {
  const trimmed = text.trim();
  if (trimmed === "") return { ok: false, error: "Enter an expected price." };
  const lakh = Number(trimmed);
  if (!/^\d+$/.test(trimmed) || !Number.isSafeInteger(lakh)) {
    return { ok: false, error: "Use whole lakh, e.g. 240 for ₹2.40 Cr." };
  }
  if (lakh < basePriceLakh) {
    return {
      ok: false,
      error: `At least the base price, ${formatLakh(basePriceLakh)}.`,
    };
  }
  return { ok: true, lakh };
}
