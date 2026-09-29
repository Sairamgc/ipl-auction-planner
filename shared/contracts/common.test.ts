import { describe, expect, it } from "vitest";

import {
  IdSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  LakhSchema,
} from "./common.ts";

describe("LakhSchema", () => {
  it("accepts whole non-negative lakh", () => {
    expect(LakhSchema.parse(0)).toBe(0);
    expect(LakhSchema.parse(240)).toBe(240);
  });

  it.each([1.5, -1, Number.NaN])("rejects %s", (value) => {
    expect(LakhSchema.safeParse(value).success).toBe(false);
  });
});

describe("IdSchema", () => {
  it.each(["csk", "virat-kohli", "2026-virat-kohli", "player-2"])(
    "accepts %s",
    (id) => {
      expect(IdSchema.safeParse(id).success).toBe(true);
    },
  );

  it.each(["", "CSK", "Virat Kohli", "virat_kohli", "-csk", "csk-", "a--b"])(
    "rejects %j",
    (id) => {
      expect(IdSchema.safeParse(id).success).toBe(false);
    },
  );
});

describe("date schemas", () => {
  it("accepts calendar dates only", () => {
    expect(IsoDateSchema.safeParse("2025-12-16").success).toBe(true);
    expect(IsoDateSchema.safeParse("2025-02-30").success).toBe(false);
    expect(IsoDateSchema.safeParse("16/12/2025").success).toBe(false);
  });

  it("accepts ISO timestamps with an offset", () => {
    expect(
      IsoDateTimeSchema.safeParse("2026-09-29T10:00:00.000Z").success,
    ).toBe(true);
    expect(IsoDateTimeSchema.safeParse("2026-09-29").success).toBe(false);
  });
});
