import {
  makeBaseline,
  makePlayers,
  makeRules,
  makeTarget,
} from "@/test/factories";
import { describe, expect, it } from "vitest";

import { summarisePlan } from "./summary";
import { planWarnings } from "./warnings";

const rules = makeRules(); // min 18, max 25, overseas 8, lowest base 30

function warningsFor(...args: Parameters<typeof summarisePlan>) {
  return planWarnings(summarisePlan(...args), rules);
}

describe("planWarnings", () => {
  it("returns none for a plan within every limit", () => {
    const baseline = makeBaseline({ retained: makePlayers(16) });
    expect(warningsFor(baseline, [makeTarget(1000), makeTarget(500)])).toEqual(
      [],
    );
  });

  it("warns when planned spend exceeds the purse", () => {
    const baseline = makeBaseline({
      purseLakh: 1640,
      retained: makePlayers(10),
    });
    expect(warningsFor(baseline, [makeTarget(1700)])).toContainEqual({
      code: "over-purse",
      overByLakh: 60,
    });
  });

  it("warns when the squad exceeds the maximum", () => {
    const baseline = makeBaseline({ retained: makePlayers(25) });
    expect(warningsFor(baseline, [makeTarget(30)])).toEqual([
      { code: "over-max-squad", squadCount: 26, maxSquadSize: 25 },
    ]);
  });

  it("does not warn at exactly the maximum", () => {
    const baseline = makeBaseline({ retained: makePlayers(24) });
    expect(warningsFor(baseline, [makeTarget(30)])).toEqual([]);
  });

  it("warns when overseas players exceed the cap", () => {
    const baseline = makeBaseline({
      retained: [...makePlayers(8, { nationality: "AUS" }), ...makePlayers(10)],
    });
    expect(
      warningsFor(baseline, [makeTarget(200, { nationality: "ENG" })]),
    ).toEqual([
      { code: "over-overseas-cap", overseasCount: 9, maxOverseas: 8 },
    ]);
  });

  describe("minimum squad affordability (D16)", () => {
    it("warns when the purse cannot buy the missing players", () => {
      // 10 in squad: 8 short × 30 = 240 needed, 100 left
      const baseline = makeBaseline({
        purseLakh: 100,
        retained: makePlayers(10),
      });
      expect(warningsFor(baseline, [])).toEqual([
        { code: "min-squad-unaffordable", shortfallLakh: 140 },
      ]);
    });

    it("warns one player short even though max safe bid is positive", () => {
      // 17 in squad, 20 left: max safe bid is +20, but 1 × 30 is needed
      const baseline = makeBaseline({
        purseLakh: 20,
        retained: makePlayers(17),
      });
      const summary = summarisePlan(baseline, []);
      expect(summary.maxSafeBidLakh).toBe(20);
      expect(planWarnings(summary, rules)).toEqual([
        { code: "min-squad-unaffordable", shortfallLakh: 10 },
      ]);
    });

    it("does not warn once the minimum is met, even when over purse", () => {
      // 18 retained + 1 target = 19: only the overspend is a problem
      const baseline = makeBaseline({
        purseLakh: 1640,
        retained: makePlayers(18),
      });
      const summary = summarisePlan(baseline, [makeTarget(1700)]);
      expect(summary.maxSafeBidLakh).toBe(-60);
      expect(planWarnings(summary, rules)).toEqual([
        { code: "over-purse", overByLakh: 60 },
      ]);
    });

    it("always pairs a negative max safe bid with a warning", () => {
      for (let squadCount = 0; squadCount <= 30; squadCount += 1) {
        for (let remaining = -300; remaining <= 300; remaining += 5) {
          const baseline = makeBaseline({
            purseLakh: remaining,
            retained: makePlayers(squadCount),
          });
          const summary = summarisePlan(baseline, []);
          if (summary.maxSafeBidLakh < 0) {
            expect(planWarnings(summary, rules).length).toBeGreaterThan(0);
          }
        }
      }
    });

    it("does not warn when the purse exactly covers the missing players", () => {
      const baseline = makeBaseline({
        purseLakh: 60,
        retained: makePlayers(16),
      });
      expect(warningsFor(baseline, [])).toEqual([]);
    });
  });

  it("reports every broken rule, in a fixed order", () => {
    // 11 in squad (all overseas) and over purse. Over-max-squad cannot
    // occur together with min-squad-unaffordable (max ≥ min).
    const baseline = makeBaseline({
      purseLakh: 100,
      retained: makePlayers(10, { nationality: "SA" }),
    });
    expect(
      warningsFor(baseline, [makeTarget(200, { nationality: "AUS" })]).map(
        (w) => w.code,
      ),
    ).toEqual(["over-purse", "over-overseas-cap", "min-squad-unaffordable"]);
  });
});
