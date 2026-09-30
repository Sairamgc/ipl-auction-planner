import type { Franchise } from "@shared/contracts";
import { makePlayer, makeRules } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { squadBaseline } from "./baseline";

const csk: Franchise = {
  id: "csk",
  name: "Chennai Super Kings",
  shortName: "CSK",
  purseRemainingLakh: 4340,
  colors: {
    primary: "#FFCB05",
    onPrimary: "#1A1A1A",
    secondary: "#0066B3",
    onSecondary: "#FFFFFF",
  },
};

describe("squadBaseline", () => {
  const dhoni = makePlayer({ id: "ms-dhoni" });
  const noor = makePlayer({ id: "noor-ahmad", nationality: "AFG" });
  const kohli = makePlayer({ id: "virat-kohli" });
  const players = new Map([dhoni, noor, kohli].map((p) => [p.id, p]));
  const rules = makeRules();

  it("joins the franchise's own retentions to players", () => {
    const retentions = [
      { franchiseId: "csk", playerId: "ms-dhoni" },
      { franchiseId: "rcb", playerId: "virat-kohli" },
      { franchiseId: "csk", playerId: "noor-ahmad" },
    ];
    expect(squadBaseline(csk, rules, retentions, players)).toEqual({
      rules,
      purseLakh: 4340,
      retained: [dhoni, noor],
    });
  });

  it("has no retained players when the franchise retained none", () => {
    expect(squadBaseline(csk, rules, [], players).retained).toEqual([]);
  });

  it("fails loudly on a retention of an unknown player", () => {
    expect(() =>
      squadBaseline(
        csk,
        rules,
        [{ franchiseId: "csk", playerId: "ghost" }],
        players,
      ),
    ).toThrow(/unknown player "ghost" by csk/);
  });
});
