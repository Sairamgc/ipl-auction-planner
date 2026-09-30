import { teamIndicatorColor } from "@/domain";
import type { CSSProperties } from "react";

/** A franchise's colour pairs (same shape as `Franchise.colors`). */
export interface TeamColors {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
}

const INDICATOR_VALUE = {
  primary: (colors: TeamColors) => colors.primary,
  secondary: (colors: TeamColors) => colors.secondary,
  foreground: () => "var(--foreground)",
} as const;

/**
 * Inline style that scopes a franchise's colours to an element (V14), for
 * `bg-team`, `text-team-foreground`, `ring-team-secondary` and friends.
 * `--team-indicator` is the team colour that can mark state at 3:1.
 */
export function teamColorStyle(colors: TeamColors): CSSProperties {
  const variables: Record<`--${string}`, string> = {
    "--team": colors.primary,
    "--team-foreground": colors.onPrimary,
    "--team-secondary": colors.secondary,
    "--team-secondary-foreground": colors.onSecondary,
    "--team-indicator": INDICATOR_VALUE[teamIndicatorColor(colors)](colors),
  };
  return variables;
}
