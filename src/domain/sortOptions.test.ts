import { POOL_SORT_FIELDS, SORT_ORDERS } from "@shared/contracts";
import { describe, expect, it } from "vitest";

import { SORT_OPTIONS, sortOptionFor } from "./sortOptions";

describe("sort options", () => {
  it("covers every sort field in both directions", () => {
    for (const sort of POOL_SORT_FIELDS) {
      for (const order of SORT_ORDERS) {
        expect(sortOptionFor(sort, order)).toMatchObject({ sort, order });
      }
    }
    expect(new Set(SORT_OPTIONS.map((option) => option.id)).size).toBe(6);
  });

  it("defaults to base price, highest first", () => {
    expect(sortOptionFor().id).toBe("basePrice-desc");
  });

  it("uses each field's default direction when none is given", () => {
    expect(sortOptionFor("name").id).toBe("name-asc");
    expect(sortOptionFor("age").label).toBe("Age: youngest first");
  });

  it("rejects combinations that do not exist", () => {
    expect(() => sortOptionFor("name", "sideways" as unknown as "asc")).toThrow(
      /No sort option/,
    );
  });
});
