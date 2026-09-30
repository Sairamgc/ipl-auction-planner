import { describe, expect, it } from "vitest";

import {
  applyChange,
  containsChange,
  diffTargets,
  isEmptyChange,
  mergeChanges,
  NO_CHANGE,
} from "./planChanges";

const t = (id: string, price: number) => ({
  auctionEntryId: `2026-${id}`,
  expectedPriceLakh: price,
});

describe("diffTargets", () => {
  it("finds added, removed and repriced targets", () => {
    expect(
      diffTargets([t("a", 200), t("b", 75)], [t("a", 250), t("c", 30)]),
    ).toEqual({
      added: [t("c", 30)],
      removed: [t("b", 75)],
      repriced: [{ auctionEntryId: "2026-a", fromLakh: 200, toLakh: 250 }],
    });
  });

  it("finds no change between equal plans", () => {
    expect(isEmptyChange(diffTargets([t("a", 200)], [t("a", 200)]))).toBe(true);
    expect(isEmptyChange(NO_CHANGE)).toBe(true);
    expect(isEmptyChange(diffTargets([], [t("a", 1)]))).toBe(false);
  });
});

describe("applyChange", () => {
  it("re-applies a change on top of later edits, keeping them", () => {
    const change = diffTargets([t("a", 200)], [t("a", 250), t("c", 30)]);
    // Meanwhile the user added d and removed nothing
    expect(applyChange([t("a", 200), t("d", 75)], change)).toEqual([
      t("a", 250),
      t("d", 75),
      t("c", 30),
    ]);
  });

  it("removes what the change removed", () => {
    const change = diffTargets([t("a", 200), t("b", 75)], [t("a", 200)]);
    expect(applyChange([t("a", 200), t("b", 75)], change)).toEqual([
      t("a", 200),
    ]);
  });

  it("sets the price of an added player who is already back in the plan", () => {
    const change = diffTargets([], [t("a", 300)]);
    expect(applyChange([t("a", 200)], change)).toEqual([t("a", 300)]);
  });

  it("skips a repricing for a player no longer in the plan", () => {
    const change = diffTargets([t("a", 200)], [t("a", 250)]);
    expect(applyChange([t("b", 75)], change)).toEqual([t("b", 75)]);
  });
});

describe("containsChange", () => {
  const change = diffTargets(
    [t("a", 200), t("b", 75)],
    [t("a", 250), t("c", 30)],
  );

  it("is true once every part is in the plan", () => {
    expect(containsChange([t("a", 250), t("c", 30), t("d", 1)], change)).toBe(
      true,
    );
  });

  it("is false while any part is missing", () => {
    expect(containsChange([t("a", 200), t("c", 30)], change)).toBe(false);
    expect(containsChange([t("a", 250), t("c", 99)], change)).toBe(false);
    expect(containsChange([t("a", 250), t("c", 30), t("b", 75)], change)).toBe(
      false,
    );
  });
});

describe("mergeChanges", () => {
  it("keeps both changes, the later winning for the same player", () => {
    const earlier = diffTargets([t("a", 200)], [t("a", 250), t("c", 30)]);
    const later = diffTargets([t("a", 200)], [t("a", 300)]);
    expect(mergeChanges(earlier, later)).toEqual({
      added: [t("c", 30)],
      removed: [],
      repriced: [{ auctionEntryId: "2026-a", fromLakh: 200, toLakh: 300 }],
    });
  });

  it("keeps an earlier removal the later change doesn't touch", () => {
    const earlier = diffTargets([t("b", 75)], []);
    const later = diffTargets([], [t("c", 30)]);
    expect(mergeChanges(earlier, later)).toEqual({
      added: [t("c", 30)],
      removed: [t("b", 75)],
      repriced: [],
    });
  });

  it("drops an earlier addition the later change removed", () => {
    const earlier = diffTargets([], [t("c", 30)]);
    const later = diffTargets([t("c", 30)], []);
    expect(mergeChanges(earlier, later)).toEqual({
      added: [],
      removed: [t("c", 30)],
      repriced: [],
    });
  });
});
