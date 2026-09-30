import { makeBaseline, makePlayers, makeRules } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { maxSafeBidView } from "./maxSafeBidView";
import { summarisePlan } from "./summary";
import { planWarnings } from "./warnings";

const rules = makeRules(); // min 18, max 25, lowest base 30

/** The view for a squad of `count` retained players and `purseLakh` left. */
function viewFor(count: number, purseLakh: number) {
  const summary = summarisePlan(
    makeBaseline({ purseLakh, retained: makePlayers(count) }),
    [],
  );
  return maxSafeBidView(summary, planWarnings(summary, rules), rules);
}

describe("maxSafeBidView", () => {
  it("counts the places still to fill after the next player", () => {
    // 16 in squad: the 17th leaves 1 place at 30
    expect(viewFor(16, 500)).toEqual({
      displayedLakh: 470,
      reason: { code: "slots", slotsToFill: 1 },
    });
  });

  it("says the next player completes the minimum when one short", () => {
    expect(viewFor(17, 500)).toEqual({
      displayedLakh: 500,
      reason: { code: "completes" },
    });
  });

  it("says the minimum is reached at or above it", () => {
    expect(viewFor(18, 500).reason).toEqual({ code: "reached" });
    expect(viewFor(24, 500).reason).toEqual({ code: "reached" });
  });

  it("has no figure once the squad is full (D18)", () => {
    expect(viewFor(25, 500)).toEqual({
      displayedLakh: null,
      reason: { code: "full" },
    });
    expect(viewFor(26, 500).reason).toEqual({ code: "full" });
  });

  it("shows ₹0 when the raw value is negative", () => {
    expect(viewFor(10, 50)).toEqual({
      displayedLakh: 0,
      reason: { code: "unsafe" },
    });
  });

  it("shows ₹0 when the minimum squad is unaffordable, even if positive (D17)", () => {
    // 17 players, ₹20 L left, lowest base ₹30 L: raw value is +20
    const summary = summarisePlan(
      makeBaseline({ purseLakh: 20, retained: makePlayers(17) }),
      [],
    );
    expect(summary.maxSafeBidLakh).toBe(20);
    expect(
      maxSafeBidView(summary, planWarnings(summary, rules), rules),
    ).toEqual({ displayedLakh: 0, reason: { code: "unsafe" } });
  });

  it("puts a full squad ahead of unsafe: no bid applies (D18)", () => {
    expect(viewFor(25, -10)).toEqual({
      displayedLakh: null,
      reason: { code: "full" },
    });
  });
});
