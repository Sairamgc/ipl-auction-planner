import { makePlayer, makeTarget } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { groupSquadByRole } from "./groupByRole";

describe("groupSquadByRole", () => {
  it("orders roles batter, wicketkeeper, all-rounder, bowler and skips empty ones", () => {
    const groups = groupSquadByRole(
      [makePlayer({ role: "bowler" }), makePlayer({ role: "batter" })],
      [makeTarget(100, { role: "all-rounder" })],
    );
    expect(groups.map((group) => group.role)).toEqual([
      "batter",
      "all-rounder",
      "bowler",
    ]);
  });

  it("lists retained players alphabetically", () => {
    const [group] = groupSquadByRole(
      [
        makePlayer({ role: "batter", name: "Virat Kohli" }),
        makePlayer({ role: "batter", name: "devdutt Padikkal" }),
      ],
      [],
    );
    expect(group?.retained.map((player) => player.name)).toEqual([
      "devdutt Padikkal",
      "Virat Kohli",
    ]);
  });

  it("puts the highest expected price first, then name (D7)", () => {
    const [group] = groupSquadByRole(
      [],
      [
        makeTarget(75, { role: "bowler", name: "B" }),
        makeTarget(200, { role: "bowler", name: "Z" }),
        makeTarget(200, { role: "bowler", name: "A" }),
      ],
    );
    expect(group?.targets.map((target) => target.player.name)).toEqual([
      "A",
      "Z",
      "B",
    ]);
  });

  it("returns no groups for an empty squad", () => {
    expect(groupSquadByRole([], [])).toEqual([]);
  });
});
