import {
  maxSafeBidView,
  planNote,
  planWarnings,
  summarisePlan,
} from "@/domain";
import {
  makeBaseline,
  makePlayers,
  makeRules,
  makeTarget,
} from "@/test/factories";
import { describe, expect, it } from "vitest";

import {
  maxSafeBidSentence,
  noteText,
  summaryBarLabel,
  warningCountText,
  warningText,
} from "./summaryText";

const rules = makeRules(); // min 18, max 25, overseas 8, lowest base 30

function derive(count: number, purseLakh: number, spend: number[] = []) {
  const summary = summarisePlan(
    makeBaseline({ purseLakh, retained: makePlayers(count) }),
    spend.map((price) => makeTarget(price)),
  );
  const warnings = planWarnings(summary, rules);
  return {
    summary,
    warnings,
    note: planNote(summary, rules),
    view: maxSafeBidView(summary, warnings, rules),
  };
}

/** The first item, failing the test if there is none. */
function first<T>(items: readonly T[]): T {
  const [item] = items;
  if (item === undefined) throw new Error("Expected at least one item");
  return item;
}

function present<T>(value: T | null): T {
  if (value === null) throw new Error("Expected a value");
  return value;
}

describe("warningText", () => {
  it("words over purse with both amounts", () => {
    const { summary, warnings } = derive(18, 4340, [4460]);
    expect(warnings.map((w) => warningText(w, summary, rules))).toEqual([
      {
        title: "Over purse by ₹1.20 Cr",
        detail: "Planned spend ₹44.60 Cr is more than the ₹43.40 Cr purse.",
        name: "over purse",
      },
    ]);
  });

  it("words over max squad and over the overseas cap", () => {
    const summary = summarisePlan(
      makeBaseline({
        retained: [
          ...makePlayers(17),
          ...makePlayers(9, { nationality: "AUS" }),
        ],
      }),
      [],
    );
    expect(
      planWarnings(summary, rules).map((w) => warningText(w, summary, rules)),
    ).toEqual([
      {
        title: "Squad over the maximum",
        detail: "26 players; the maximum is 25.",
        name: "squad over the maximum",
      },
      {
        title: "Too many overseas players",
        detail: "9 overseas; the cap is 8.",
        name: "too many overseas players",
      },
    ]);
  });

  it("words the unaffordable minimum squad, singular and plural", () => {
    const one = derive(17, 20);
    expect(warningText(first(one.warnings), one.summary, rules).detail).toBe(
      "₹10 L short of 1 more player at ₹30 L each.",
    );
    const two = derive(16, 40);
    expect(warningText(first(two.warnings), two.summary, rules)).toEqual({
      title: "Can't afford the minimum squad",
      detail: "₹20 L short of 2 more players at ₹30 L each.",
      name: "can't afford the minimum squad",
    });
  });
});

describe("noteText", () => {
  it("words the note, singular and plural", () => {
    expect(noteText(present(derive(16, 4340).note))).toEqual({
      title: "2 players short of the minimum",
      detail: "Squad 16; the minimum is 18.",
      name: "below the minimum squad",
    });
    expect(noteText(present(derive(17, 4340).note)).title).toBe(
      "1 player short of the minimum",
    );
  });
});

describe("maxSafeBidSentence", () => {
  const sentence = (count: number, purse: number) => {
    const { view, summary } = derive(count, purse);
    return maxSafeBidSentence(view, summary, rules);
  };

  it("words every reason", () => {
    expect(sentence(15, 4340)).toBe(
      "The most you can bid for your next player and still buy 2 more players at ₹30 L to reach 18.",
    );
    expect(sentence(16, 4340)).toBe(
      "The most you can bid for your next player and still buy 1 more player at ₹30 L to reach 18.",
    );
    expect(sentence(17, 4340)).toBe(
      "Your next player completes the minimum squad.",
    );
    expect(sentence(18, 4340)).toBe("Your squad already reaches the minimum.");
    expect(sentence(25, 4340)).toBe("Your squad is full (25 of 25).");
    expect(sentence(17, 20)).toBe("Not enough purse left. See warnings.");
  });
});

describe("summaryBarLabel", () => {
  it("reads the live figures", () => {
    const { summary, view } = derive(16, 4340, [4120]);
    expect(
      summaryBarLabel({
        remainingLakh: summary.remainingLakh,
        maxSafeBid: view,
        warningCount: 2,
      }),
    ).toBe(
      "Purse left ₹2.20 Cr, max safe bid ₹2.20 Cr, 2 warnings. Open summary",
    );
  });

  it("says when it is not safe to bid, and reads negatives as minus", () => {
    const { summary, view } = derive(18, 100, [220]);
    expect(
      summaryBarLabel({
        remainingLakh: summary.remainingLakh,
        maxSafeBid: view,
        warningCount: 1,
      }),
    ).toBe(
      "Purse left minus ₹1.20 Cr, max safe bid ₹0 L, not enough purse left, 1 warning. Open summary",
    );
  });

  it("says max safe bid doesn't apply to a full squad (D18)", () => {
    const { summary, view } = derive(25, 500);
    expect(
      summaryBarLabel({
        remainingLakh: summary.remainingLakh,
        maxSafeBid: view,
        warningCount: 0,
      }),
    ).toBe(
      "Purse left ₹5.00 Cr, max safe bid not applicable, squad full, no warnings. Open summary",
    );
  });

  it("reads unavailable figures", () => {
    expect(summaryBarLabel(null)).toBe(
      "Plan summary unavailable. Open summary",
    );
  });
});

describe("warningCountText", () => {
  it("counts warnings", () => {
    expect(warningCountText(0)).toBe("no warnings");
    expect(warningCountText(1)).toBe("1 warning");
    expect(warningCountText(3)).toBe("3 warnings");
  });
});
