import { describe, expect, it } from "vitest";

import { parseSearch, stringifySearch } from "./searchParams";

describe("stringifySearch", () => {
  it("writes lists comma-separated and scalars as plain strings", () => {
    expect(
      stringifySearch({
        role: ["batter", "bowler"],
        overseas: true,
        minBase: 75,
        sort: "name",
      }),
    ).toBe("?role=batter,bowler&overseas=true&minBase=75&sort=name");
  });

  it("omits empty values", () => {
    expect(
      stringifySearch({ search: "", role: [], tab: undefined, x: null }),
    ).toBe("");
  });

  it("encodes text safely", () => {
    expect(stringifySearch({ search: "de kock & co" })).toBe(
      "?search=de+kock+%26+co",
    );
  });

  it("ignores values that cannot be written to a URL", () => {
    expect(stringifySearch({ nested: { a: 1 }, ok: "yes" })).toBe("?ok=yes");
  });
});

describe("parseSearch", () => {
  it("reads every value as a string", () => {
    expect(
      parseSearch("?role=batter,bowler&minBase=75&search=de+kock"),
    ).toEqual({ role: "batter,bowler", minBase: "75", search: "de kock" });
  });

  it("round-trips with stringifySearch", () => {
    const search = { role: "batter,bowler", sort: "age" };
    expect(parseSearch(stringifySearch(search))).toEqual(search);
  });
});
