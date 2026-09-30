import { makeBaseline, makePlayer, makeTarget } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { summarisePlan } from "./summary";

describe("summarisePlan", () => {
  it("summarises the baseline alone when there are no targets", () => {
    const baseline = makeBaseline({
      purseLakh: 4340,
      retained: [
        makePlayer({ role: "batter" }),
        makePlayer({ role: "bowler", nationality: "AFG" }),
      ],
    });

    expect(summarisePlan(baseline, [])).toEqual({
      purseLakh: 4340,
      plannedSpendLakh: 0,
      remainingLakh: 4340,
      squadCount: 2,
      overseasCount: 1,
      roleBreakdown: {
        batter: 1,
        bowler: 1,
        "all-rounder": 0,
        wicketkeeper: 0,
      },
      // 2 in squad: bidding for the 3rd leaves 15 slots × 30
      maxSafeBidLakh: 4340 - 15 * 30,
    });
  });

  it("counts retained players and targets together (D11)", () => {
    const baseline = makeBaseline({
      purseLakh: 1640,
      retained: [makePlayer({ role: "batter", nationality: "ENG" })],
    });
    const targets = [
      makeTarget(700, { role: "all-rounder" }),
      makeTarget(200, { role: "bowler", nationality: "NZ" }),
      makeTarget(75, { role: "wicketkeeper", nationality: "ENG" }),
    ];

    const summary = summarisePlan(baseline, targets);

    expect(summary.plannedSpendLakh).toBe(975);
    expect(summary.remainingLakh).toBe(665);
    expect(summary.squadCount).toBe(4);
    expect(summary.overseasCount).toBe(3);
    expect(summary.roleBreakdown).toEqual({
      batter: 1,
      bowler: 1,
      "all-rounder": 1,
      wicketkeeper: 1,
    });
    // 4 in squad: bidding for the 5th leaves 13 slots × 30 = 390
    expect(summary.maxSafeBidLakh).toBe(665 - 390);
  });

  it("goes negative when the plan is over purse", () => {
    const summary = summarisePlan(makeBaseline({ purseLakh: 500 }), [
      makeTarget(600),
    ]);
    expect(summary.remainingLakh).toBe(-100);
  });
});
