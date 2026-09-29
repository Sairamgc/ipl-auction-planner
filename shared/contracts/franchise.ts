import { z } from "zod";

import { IdSchema, LakhSchema } from "./common.ts";

/** `#RRGGBB`. */
export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Must be a #RRGGBB hex colour");

/**
 * Team accent colours (V3, V9–V11). `on*` colours are the paired text
 * colours for text drawn on the fill; team colours are never body text.
 */
export const FranchiseColorsSchema = z.object({
  primary: HexColorSchema,
  onPrimary: HexColorSchema,
  secondary: HexColorSchema,
  onSecondary: HexColorSchema,
});
export type FranchiseColors = z.infer<typeof FranchiseColorsSchema>;

export const FranchiseSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  logoPath: z.string().min(1).optional(),
  /** Official pre-auction purse; a plan never changes it (P12). */
  purseRemainingLakh: LakhSchema,
  colors: FranchiseColorsSchema,
});
export type Franchise = z.infer<typeof FranchiseSchema>;
