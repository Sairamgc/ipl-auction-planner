import { HOME_NATIONALITY, type Nationality } from "@shared/contracts";

/** Overseas = any nationality other than India (D3). */
export function isOverseas(nationality: Nationality): boolean {
  return nationality !== HOME_NATIONALITY;
}
