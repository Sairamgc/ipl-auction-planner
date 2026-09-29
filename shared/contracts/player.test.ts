import { describe, expect, it } from "vitest";

import { HOME_NATIONALITY, NATIONALITIES, PlayerSchema } from "./player.ts";

const player = {
  id: "virat-kohli",
  name: "Virat Kohli",
  dateOfBirth: "1988-11-05",
  nationality: "IND",
  role: "batter",
  battingHand: "right",
  bowlingStyle: "right-arm-medium",
  isCapped: true,
};

describe("PlayerSchema", () => {
  it("accepts a valid player", () => {
    expect(PlayerSchema.parse(player)).toEqual(player);
  });

  it.each([
    ["nationality", "India"],
    ["role", "Batter"],
    ["battingHand", "both"],
    ["bowlingStyle", "chinaman"],
    ["dateOfBirth", "05-11-1988"],
    ["isCapped", "yes"],
  ])("rejects an invalid %s", (field, value) => {
    expect(PlayerSchema.safeParse({ ...player, [field]: value }).success).toBe(
      false,
    );
  });
});

describe("nationalities", () => {
  it("includes the home nation", () => {
    expect(NATIONALITIES).toContain(HOME_NATIONALITY);
  });
});
