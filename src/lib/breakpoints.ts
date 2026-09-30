/**
 * Layout breakpoints (V8), matching Tailwind's `md` (48rem) and `xl`
 * (80rem). Below `md` is mobile, `md` up to `xl` is tablet, `xl` and up
 * is desktop.
 */
export const BREAKPOINTS = {
  tablet: "(min-width: 48rem)",
  desktop: "(min-width: 80rem)",
} as const;

export type Viewport = "mobile" | "tablet" | "desktop";
