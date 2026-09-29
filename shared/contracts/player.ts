import { z } from "zod";

import { IdSchema, IsoDateSchema } from "./common.ts";

/**
 * Cricket-nation codes (D3). Provisional: the 12 ICC Full Members, confirmed
 * or extended once the full dataset is compiled. Display names live in domain.
 */
export const NATIONALITIES = [
  "IND",
  "AUS",
  "ENG",
  "NZ",
  "SA",
  "WI",
  "SL",
  "PAK",
  "BAN",
  "AFG",
  "ZIM",
  "IRE",
] as const;
export const NationalitySchema = z.enum(NATIONALITIES);
export type Nationality = z.infer<typeof NationalitySchema>;

/** Every other nationality counts as overseas (D3). */
export const HOME_NATIONALITY = "IND" satisfies Nationality;

export const PLAYER_ROLES = [
  "batter",
  "bowler",
  "all-rounder",
  "wicketkeeper",
] as const;
export const PlayerRoleSchema = z.enum(PLAYER_ROLES);
export type PlayerRole = z.infer<typeof PlayerRoleSchema>;

export const BATTING_HANDS = ["right", "left"] as const;
export const BattingHandSchema = z.enum(BATTING_HANDS);
export type BattingHand = z.infer<typeof BattingHandSchema>;

export const BOWLING_STYLES = [
  "right-arm-fast",
  "right-arm-medium",
  "off-spin",
  "leg-spin",
  "left-arm-fast",
  "left-arm-medium",
  "left-arm-orthodox",
  "left-arm-wrist-spin",
  "none",
] as const;
export const BowlingStyleSchema = z.enum(BOWLING_STYLES);
export type BowlingStyle = z.infer<typeof BowlingStyleSchema>;

export const PlayerSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  dateOfBirth: IsoDateSchema,
  nationality: NationalitySchema,
  role: PlayerRoleSchema,
  battingHand: BattingHandSchema,
  bowlingStyle: BowlingStyleSchema,
  isCapped: z.boolean(),
});
export type Player = z.infer<typeof PlayerSchema>;
