import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AuctionResultSchema } from "./auctionResult.ts";
import { PlanSchema } from "./plan.ts";
import { PoolQuerySchema } from "./pool.ts";
import { toStrict } from "./strict.ts";

const Nested = z.object({
  inner: z.object({ a: z.string() }),
  list: z.array(z.object({ b: z.number() })),
  maybe: z.object({ c: z.boolean() }).optional(),
  nothing: z.object({ d: z.string() }).nullable(),
  withDefault: z.object({ e: z.string() }).default({ e: "x" }),
});

const valid = {
  inner: { a: "a" },
  list: [{ b: 1 }],
  maybe: { c: true },
  nothing: { d: "d" },
  withDefault: { e: "e" },
};

describe("toStrict", () => {
  const Strict = toStrict(Nested);

  it("accepts valid input with the same output", () => {
    expect(Strict.parse(valid)).toEqual(Nested.parse(valid));
  });

  it.each([
    ["top level", { ...valid, extra: 1 }],
    ["nested object", { ...valid, inner: { a: "a", extra: 1 } }],
    ["array element", { ...valid, list: [{ b: 1, extra: 1 }] }],
    ["optional", { ...valid, maybe: { c: true, extra: 1 } }],
    ["nullable", { ...valid, nothing: { d: "d", extra: 1 } }],
    ["default", { ...valid, withDefault: { e: "e", extra: 1 } }],
  ])("rejects unknown keys: %s", (_where, input) => {
    expect(Strict.safeParse(input).success).toBe(false);
  });

  it("leaves the original schema stripping unknown keys", () => {
    expect(Nested.parse({ ...valid, extra: 1 })).not.toHaveProperty("extra");
  });

  it("rejects unknown keys in union members", () => {
    const result = toStrict(AuctionResultSchema).safeParse({
      auctionEntryId: "2026-a",
      status: "unsold",
      priceLakh: 100,
    });
    expect(result.success).toBe(false);
  });

  it("keeps refinements", () => {
    const StrictPlan = toStrict(PlanSchema);
    const target = { auctionEntryId: "2026-a", expectedPriceLakh: 100 };
    expect(
      StrictPlan.safeParse({
        id: "csk",
        franchiseId: "csk",
        targets: [target, target],
        updatedAt: null,
      }).success,
    ).toBe(false);
  });

  it("keeps transforms, and rejects unknown query parameters", () => {
    const StrictQuery = toStrict(PoolQuerySchema);
    expect(StrictQuery.parse({ sort: "name" }).order).toBe("asc");
    expect(StrictQuery.safeParse({ colour: "blue" }).success).toBe(false);
  });
});
