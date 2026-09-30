import { contrastRatio } from "@shared/color/contrast";
import type { FranchiseColors } from "@shared/contracts";

/** WCAG 1.4.11: state indicators need 3:1 against what surrounds them. */
export const MIN_NON_TEXT_CONTRAST = 3;

/** The app's page background (light mode only, P11). */
export const PAGE_BACKGROUND = "#FFFFFF";

export type TeamIndicator = "primary" | "secondary" | "foreground";

/**
 * Which colour can mark state in team colours (e.g. the active mobile tab)
 * and still be seen: the primary if it reaches 3:1 on the page, otherwise
 * the secondary, otherwise plain foreground.
 */
export function teamIndicatorColor(
  colors: Pick<FranchiseColors, "primary" | "secondary">,
  background: string = PAGE_BACKGROUND,
): TeamIndicator {
  if (contrastRatio(colors.primary, background) >= MIN_NON_TEXT_CONTRAST) {
    return "primary";
  }
  if (contrastRatio(colors.secondary, background) >= MIN_NON_TEXT_CONTRAST) {
    return "secondary";
  }
  return "foreground";
}
