import { describe, expect, it } from "vitest";

import { PoolQuerySchema } from "./pool.ts";

describe("PoolQuerySchema", () => {
  it("applies defaults to an empty query", () => {
    expect(PoolQuerySchema.parse({})).toEqual({
      sort: "basePrice",
      order: "desc",
      page: 1,
      pageSize: 25,
    });
  });

  it.each([
    ["name", "asc"],
    ["age", "asc"],
    ["basePrice", "desc"],
  ])("defaults the order for sort=%s to %s", (sort, order) => {
    expect(PoolQuerySchema.parse({ sort }).order).toBe(order);
  });

  it("keeps an explicit order", () => {
    expect(PoolQuerySchema.parse({ sort: "name", order: "desc" }).order).toBe(
      "desc",
    );
  });

  it("parses every filter from query-string values", () => {
    expect(
      PoolQuerySchema.parse({
        search: "  kohli ",
        role: "batter,all-rounder",
        overseas: "false",
        capped: "true",
        battingHand: "left",
        bowlingStyle: "leg-spin,left-arm-wrist-spin",
        minBase: "30",
        maxBase: "200",
        page: "3",
        pageSize: "50",
      }),
    ).toEqual({
      search: "kohli",
      role: ["batter", "all-rounder"],
      overseas: false,
      capped: true,
      battingHand: "left",
      bowlingStyle: ["leg-spin", "left-arm-wrist-spin"],
      minBase: 30,
      maxBase: 200,
      sort: "basePrice",
      order: "desc",
      page: 3,
      pageSize: 50,
    });
  });

  it("treats a blank search as no search", () => {
    expect(PoolQuerySchema.parse({ search: "   " }).search).toBeUndefined();
  });

  it.each([
    ["role", "captain"],
    ["role", ""],
    ["bowlingStyle", "chinaman"],
    ["battingHand", "both"],
    ["overseas", "maybe"],
    ["minBase", "1.5"],
    ["minBase", "-10"],
    ["sort", "price"],
    ["order", "up"],
    ["page", "0"],
    ["pageSize", "101"],
  ])("rejects %s=%j", (key, value) => {
    expect(PoolQuerySchema.safeParse({ [key]: value }).success).toBe(false);
  });

  it("rejects a minimum base above the maximum", () => {
    const result = PoolQuerySchema.safeParse({
      minBase: "200",
      maxBase: "100",
    });
    expect(result.error?.issues[0]?.path).toEqual(["minBase"]);
  });
});
