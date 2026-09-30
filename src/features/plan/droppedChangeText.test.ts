import { diffTargets, NO_CHANGE } from "@/domain";
import { describe, expect, it } from "vitest";

import { droppedChangeText } from "./droppedChangeText";

const t = (id: string, price: number) => ({
  auctionEntryId: `2026-${id}`,
  expectedPriceLakh: price,
});
const names = new Map([
  ["2026-conway", "Devon Conway"],
  ["2026-green", "Cameron Green"],
]);

describe("droppedChangeText", () => {
  it("names a single dropped add, remove or price change", () => {
    expect(droppedChangeText(diffTargets([], [t("conway", 250)]), names)).toBe(
      "Couldn’t add Devon Conway. Your saved plan doesn’t include it.",
    );
    expect(droppedChangeText(diffTargets([t("green", 200)], []), names)).toBe(
      "Couldn’t remove Cameron Green. Your saved plan doesn’t include it.",
    );
    expect(
      droppedChangeText(
        diffTargets([t("green", 200)], [t("green", 240)]),
        names,
      ),
    ).toBe(
      "Couldn’t change Cameron Green’s price to ₹2.40 Cr. Your saved plan doesn’t include it.",
    );
  });

  it("lists several dropped changes", () => {
    expect(
      droppedChangeText(
        diffTargets([t("green", 200)], [t("conway", 250)]),
        names,
      ),
    ).toBe(
      "Couldn’t save 2 changes: add Devon Conway; remove Cameron Green. Your saved plan doesn’t include them.",
    );
  });

  it("falls back to the entry id and to a generic message", () => {
    expect(droppedChangeText(diffTargets([], [t("x", 30)]), names)).toBe(
      "Couldn’t add 2026-x. Your saved plan doesn’t include it.",
    );
    expect(droppedChangeText(NO_CHANGE, names)).toBe(
      "Couldn’t save your last change.",
    );
  });
});
