import {
  makeBaseline,
  makePlayers,
  makeRules,
  makeTarget,
} from "@/test/factories";
import { describe, expect, it } from "vitest";

import { planNote } from "./note";
import { summarisePlan } from "./summary";

const rules = makeRules(); // min 18

describe("planNote", () => {
  it("notes how many players the squad is short", () => {
    const baseline = makeBaseline({ retained: makePlayers(16) });
    expect(planNote(summarisePlan(baseline, []), rules)).toEqual({
      code: "below-min-squad",
      squadCount: 16,
      minSquadSize: 18,
      playersShort: 2,
    });
  });

  it("counts targets towards the minimum", () => {
    const baseline = makeBaseline({ retained: makePlayers(16) });
    const summary = summarisePlan(baseline, [makeTarget(30), makeTarget(30)]);
    expect(planNote(summary, rules)).toBeNull();
  });

  it("has no note above the minimum", () => {
    const baseline = makeBaseline({ retained: makePlayers(20) });
    expect(planNote(summarisePlan(baseline, []), rules)).toBeNull();
  });
});
