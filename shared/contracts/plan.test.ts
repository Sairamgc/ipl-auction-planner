import { describe, expect, it } from "vitest";

import { PlanSchema, SavePlanRequestSchema } from "./plan.ts";
import { toStrict } from "./strict.ts";

const plan = {
  id: "csk",
  franchiseId: "csk",
  targets: [
    { auctionEntryId: "2026-a", expectedPriceLakh: 200 },
    { auctionEntryId: "2026-b", expectedPriceLakh: 75 },
  ],
  updatedAt: "2026-09-29T10:00:00.000Z",
};

describe("PlanSchema", () => {
  it("accepts a saved plan", () => {
    expect(PlanSchema.parse(plan)).toEqual(plan);
  });

  it("accepts a never-saved empty plan", () => {
    const seeded = {
      id: "csk",
      franchiseId: "csk",
      targets: [],
      updatedAt: null,
    };
    expect(PlanSchema.parse(seeded)).toEqual(seeded);
  });

  it("rejects an id that differs from the franchise", () => {
    const result = PlanSchema.safeParse({ ...plan, id: "rcb" });
    expect(result.error?.issues[0]?.path).toEqual(["id"]);
  });

  it("rejects the same auction entry targeted twice", () => {
    const first = plan.targets[0];
    const result = PlanSchema.safeParse({
      ...plan,
      targets: [first, { ...first, expectedPriceLakh: 300 }],
    });
    expect(result.error?.issues[0]?.path).toEqual(["targets"]);
  });

  it("rejects fractional or zero prices", () => {
    for (const expectedPriceLakh of [0, 12.5]) {
      const targets = [{ auctionEntryId: "2026-a", expectedPriceLakh }];
      expect(PlanSchema.safeParse({ ...plan, targets }).success).toBe(false);
    }
  });
});

describe("SavePlanRequestSchema", () => {
  const request = {
    id: plan.id,
    franchiseId: plan.franchiseId,
    targets: plan.targets,
  };

  it("accepts a plan without updatedAt", () => {
    expect(SavePlanRequestSchema.parse(request)).toEqual(request);
  });

  it("keeps the plan rules", () => {
    expect(
      SavePlanRequestSchema.safeParse({ ...request, franchiseId: "rcb" })
        .success,
    ).toBe(false);
  });

  it("rejects a client-sent updatedAt when strict", () => {
    expect(toStrict(SavePlanRequestSchema).safeParse(plan).success).toBe(false);
  });
});
