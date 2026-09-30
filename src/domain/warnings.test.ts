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

  it("reports min-squad-unaffordable whenever max safe bid is negative, even with the minimum already met (D5 as written)", () => {
    const baseline = makeBaseline({
      purseLakh: 1640,
      retained: makePlayers(18),
    });
    expect(warningsFor(baseline, [makeTarget(1700)])).toEqual([
      { code: "over-purse", overByLakh: 60 },
      { code: "min-squad-unaffordable", shortfallLakh: 60 },
    ]);
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

  it("warns when the purse cannot fill the minimum squad", () => {
    // 10 in squad, 100 left: the next player leaves 7 slots × 30 = 210
    const baseline = makeBaseline({
      purseLakh: 100,
      retained: makePlayers(10),
    });
    expect(warningsFor(baseline, [])).toEqual([
      { code: "min-squad-unaffordable", shortfallLakh: 110 },
    ]);
  });

  it("reports every broken rule, in a fixed order", () => {
    const baseline = makeBaseline({
      purseLakh: 100,
      retained: makePlayers(25, { nationality: "SA" }),
    });
    expect(warningsFor(baseline, [makeTarget(200)]).map((w) => w.code)).toEqual(
      [
        "over-purse",
        "over-max-squad",
        "over-overseas-cap",
        "min-squad-unaffordable",
      ],
    );
  });
});
