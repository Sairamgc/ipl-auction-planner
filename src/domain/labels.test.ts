import {
  BATTING_HANDS,
  BOWLING_STYLES,
  NATIONALITIES,
  PLAYER_ROLES,
} from "@shared/contracts";
import { describe, expect, it } from "vitest";

import {
  BATTING_HAND_LABELS,
  BOWLING_STYLE_LABELS,
  NATIONALITY_LABELS,
  ROLE_LABELS,
} from "./labels";

describe("labels", () => {
  it.each([
    ["role", PLAYER_ROLES, ROLE_LABELS],
    ["batting hand", BATTING_HANDS, BATTING_HAND_LABELS],
    ["bowling style", BOWLING_STYLES, BOWLING_STYLE_LABELS],
    ["nationality", NATIONALITIES, NATIONALITY_LABELS],
  ] as const)("has a unique label for every %s", (_name, values, labels) => {
    const texts = values.map(
      (value: string) => (labels as Record<string, string>)[value],
    );
    expect(
      texts.every((text) => typeof text === "string" && text.length > 0),
    ).toBe(true);
    expect(new Set(texts).size).toBe(values.length);
  });

  it("uses the display names from the requirements", () => {
    expect(ROLE_LABELS["all-rounder"]).toBe("All-rounder");
    expect(BOWLING_STYLE_LABELS["left-arm-wrist-spin"]).toBe(
      "Left-arm wrist spin",
    );
    expect(NATIONALITY_LABELS.WI).toBe("West Indies");
  });
});
