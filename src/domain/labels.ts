import type {
  BattingHand,
  BowlingStyle,
  Nationality,
  PlayerRole,
} from "@shared/contracts";

export const ROLE_LABELS: Record<PlayerRole, string> = {
  batter: "Batter",
  bowler: "Bowler",
  "all-rounder": "All-rounder",
  wicketkeeper: "Wicketkeeper",
};

/** Role group headings in the plan panel. */
export const ROLE_PLURAL_LABELS: Record<PlayerRole, string> = {
  batter: "Batters",
  bowler: "Bowlers",
  "all-rounder": "All-rounders",
  wicketkeeper: "Wicketkeepers",
};

export const BATTING_HAND_LABELS: Record<BattingHand, string> = {
  right: "Right",
  left: "Left",
};

export const BOWLING_STYLE_LABELS: Record<BowlingStyle, string> = {
  "right-arm-fast": "Right-arm fast",
  "right-arm-medium": "Right-arm medium",
  "off-spin": "Off-spin",
  "leg-spin": "Leg-spin",
  "left-arm-fast": "Left-arm fast",
  "left-arm-medium": "Left-arm medium",
  "left-arm-orthodox": "Left-arm orthodox",
  "left-arm-wrist-spin": "Left-arm wrist spin",
  none: "None",
};

export const NATIONALITY_LABELS: Record<Nationality, string> = {
  IND: "India",
  AUS: "Australia",
  ENG: "England",
  NZ: "New Zealand",
  SA: "South Africa",
  WI: "West Indies",
  SL: "Sri Lanka",
  PAK: "Pakistan",
  BAN: "Bangladesh",
  AFG: "Afghanistan",
  ZIM: "Zimbabwe",
  IRE: "Ireland",
};
