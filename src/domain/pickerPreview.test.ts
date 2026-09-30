import { makeBaseline, makePlayers } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { baselineFigures, pickerPreview, planStatus } from "./pickerPreview";

const target = { auctionEntryId: "2026-a", expectedPriceLakh: 100 };

describe("baselineFigures", () => {
  it("matches CSK before the auction: 16 retained, 4 overseas", () => {
    const baseline = makeBaseline({
      purseLakh: 4340,
      retained: [...makePlayers(12), ...makePlayers(4, { nationality: "AUS" })],
    });
    expect(baselineFigures(baseline)).toEqual({
      purseLakh: 4340,
      openSlots: 9,
      openOverseasSlots: 4,
    });
  });

  it("never reports negative open slots", () => {
    const baseline = makeBaseline({
      retained: makePlayers(26, { nationality: "ENG" }),
    });
    expect(baselineFigures(baseline)).toMatchObject({
      openSlots: 0,
      openOverseasSlots: 0,
    });
  });
});

describe("planStatus", () => {
  it("is not started for an empty plan", () => {
    expect(planStatus({ targets: [] })).toEqual({ kind: "not-started" });
  });

  it("counts targets otherwise", () => {
    expect(
      planStatus({
        targets: [target, { ...target, auctionEntryId: "2026-b" }],
      }),
    ).toEqual({
      kind: "in-progress",
      targetCount: 2,
    });
  });
});

describe("pickerPreview", () => {
  it("combines the baseline figures and plan status", () => {
    const baseline = makeBaseline({
      purseLakh: 1640,
      retained: makePlayers(17),
    });
    expect(pickerPreview(baseline, { targets: [target] })).toEqual({
      purseLakh: 1640,
      openSlots: 8,
      openOverseasSlots: 8,
      planStatus: { kind: "in-progress", targetCount: 1 },
    });
  });
});
