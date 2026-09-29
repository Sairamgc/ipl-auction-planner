import { describe, expect, it } from "vitest";

import { FranchiseSchema, HexColorSchema } from "./franchise.ts";

const franchise = {
  id: "csk",
  name: "Chennai Super Kings",
  shortName: "CSK",
  purseRemainingLakh: 4340,
  colors: {
    primary: "#FDB913",
    onPrimary: "#1A1A1A",
    secondary: "#0081C8",
    onSecondary: "#FFFFFF",
  },
};

describe("HexColorSchema", () => {
  it.each(["#FDB913", "#fdb913", "#000000"])("accepts %s", (color) => {
    expect(HexColorSchema.safeParse(color).success).toBe(true);
  });

  it.each(["FDB913", "#FFF", "#FDB91300", "rgb(0,0,0)", "yellow"])(
    "rejects %s",
    (color) => {
      expect(HexColorSchema.safeParse(color).success).toBe(false);
    },
  );
});

describe("FranchiseSchema", () => {
  it("accepts a franchise without a logo", () => {
    expect(FranchiseSchema.parse(franchise)).toEqual(franchise);
  });

  it("accepts a logo path", () => {
    const withLogo = { ...franchise, logoPath: "/logos/csk.svg" };
    expect(FranchiseSchema.parse(withLogo)).toEqual(withLogo);
  });

  it("requires all four colours", () => {
    const { primary, onPrimary, secondary } = franchise.colors;
    const colors = { primary, onPrimary, secondary };
    expect(FranchiseSchema.safeParse({ ...franchise, colors }).success).toBe(
      false,
    );
  });
});
