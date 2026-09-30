import type { CSSProperties } from "react";

/** A franchise's colour pairs (same shape as `Franchise.colors`). */
export interface TeamColors {
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
}

/**
 * Inline style that scopes a franchise's colours to an element (V14), for
 * `bg-team`, `text-team-foreground`, `ring-team-secondary` and friends.
 */
export function teamColorStyle(colors: TeamColors): CSSProperties {
  const variables: Record<`--${string}`, string> = {
    "--team": colors.primary,
    "--team-foreground": colors.onPrimary,
    "--team-secondary": colors.secondary,
    "--team-secondary-foreground": colors.onSecondary,
  };
  return variables;
}
