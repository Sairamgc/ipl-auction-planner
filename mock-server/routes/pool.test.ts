import { describe, expect, it } from "vitest";

import {
  type Player,
  type PoolQueryInput,
  PoolQuerySchema,
} from "../../shared/contracts/index.ts";

import { queryPool } from "./pool.ts";

function player(
  id: string,
  name: string,
  overrides: Partial<Player> = {},
): Player {
  return {
    id,
    name,
    dateOfBirth: "2000-01-01",
    nationality: "IND",
    role: "batter",
    battingHand: "right",
    bowlingStyle: "none",
    isCapped: true,
    ...overrides,
  };
}

// Two players share a name (tie-break), one name has an accent (search)
const players: Player[] = [
  player("amit-kumar", "Amit Kumar", {
    isCapped: false,
    dateOfBirth: "2004-01-01",
  }),
  player("ben-stokes", "Ben Stokes", {
    nationality: "ENG",
    role: "all-rounder",
    battingHand: "left",
    bowlingStyle: "right-arm-fast",
    dateOfBirth: "1991-06-04",
  }),
  player("chris-lynn", "Chris Lynn", {
    nationality: "AUS",
    dateOfBirth: "1990-04-10",
  }),
  player("deepak-rao", "Deepak Rao", {
    role: "bowler",
    bowlingStyle: "leg-spin",
    isCapped: false,
    dateOfBirth: "2005-02-02",
  }),
  player("elan-singh", "Élan Singh", {
    role: "wicketkeeper",
    battingHand: "left",
    dateOfBirth: "1998-03-03",
  }),
  player("fazal-khan", "Fazal Khan", {
    nationality: "AFG",
    role: "bowler",
    battingHand: "left",
    bowlingStyle: "left-arm-wrist-spin",
    dateOfBirth: "1999-09-09",
  }),
  player("amit-kumar-2", "Amit Kumar", {
    role: "bowler",
    bowlingStyle: "off-spin",
    isCapped: false,
    dateOfBirth: "2003-05-05",
  }),
];

const base: Record<string, number> = {
  "amit-kumar": 30,
  "ben-stokes": 200,
  "chris-lynn": 150,
  "deepak-rao": 30,
  "elan-singh": 75,
  "fazal-khan": 200,
  "amit-kumar-2": 30,
};

const db = {
  players,
  auctionEntries: players.map((p) => ({
    id: `2026-${p.id}`,
    playerId: p.id,
    basePriceLakh: base[p.id] ?? 30,
  })),
};

/** Player ids in result order, for the given raw query string values. */
function ids(input: PoolQueryInput = {}) {
  return queryPool(db, PoolQuerySchema.parse(input)).items.map(
    (row) => row.player.id,
  );
}

describe("queryPool", () => {
  it("joins each entry with its player", () => {
    const [row] = queryPool(
      db,
      PoolQuerySchema.parse({ search: "lynn" }),
    ).items;
    expect(row).toEqual({
      id: "2026-chris-lynn",
      basePriceLakh: 150,
      player: players[2],
    });
  });

  it("skips entries whose player is missing", () => {
    const broken = {
      ...db,
      auctionEntries: [
        ...db.auctionEntries,
        { id: "2026-ghost", playerId: "ghost", basePriceLakh: 30 },
      ],
    };
    expect(queryPool(broken, PoolQuerySchema.parse({})).total).toBe(7);
  });

  describe("sorting", () => {
    it("defaults to base price, highest first, then name, then id", () => {
      expect(ids()).toEqual([
        "ben-stokes",
        "fazal-khan",
        "chris-lynn",
        "elan-singh",
        "amit-kumar",
        "amit-kumar-2",
        "deepak-rao",
      ]);
    });

    it("sorts by name, ignoring accents, with id breaking ties", () => {
      expect(ids({ sort: "name" })).toEqual([
        "amit-kumar",
        "amit-kumar-2",
        "ben-stokes",
        "chris-lynn",
        "deepak-rao",
        "elan-singh",
        "fazal-khan",
      ]);
    });

    it("keeps the id tie-break ascending when sorting names descending", () => {
      expect(ids({ sort: "name", order: "desc" })).toEqual([
        "fazal-khan",
        "elan-singh",
        "deepak-rao",
        "chris-lynn",
        "ben-stokes",
        "amit-kumar",
        "amit-kumar-2",
      ]);
    });

    it("sorts age ascending as youngest first", () => {
      expect(ids({ sort: "age" })).toEqual([
        "deepak-rao",
        "amit-kumar",
        "amit-kumar-2",
        "fazal-khan",
        "elan-singh",
        "ben-stokes",
        "chris-lynn",
      ]);
    });

    it("sorts age descending as oldest first", () => {
      expect(ids({ sort: "age", order: "desc" })[0]).toBe("chris-lynn");
    });

    it("sorts base price ascending with name tie-breaks", () => {
      expect(ids({ sort: "basePrice", order: "asc" }).slice(0, 3)).toEqual([
        "amit-kumar",
        "amit-kumar-2",
        "deepak-rao",
      ]);
    });
  });

  describe("filters", () => {
    it("searches names ignoring case and accents", () => {
      expect(ids({ search: "AMIT" })).toHaveLength(2);
      expect(ids({ search: "elan" })).toEqual(["elan-singh"]);
      expect(ids({ search: "Élan" })).toEqual(["elan-singh"]);
      expect(ids({ search: "stokes" })).toEqual(["ben-stokes"]);
    });

    it("matches any of several roles", () => {
      expect(ids({ role: "wicketkeeper,all-rounder" }).sort()).toEqual([
        "ben-stokes",
        "elan-singh",
      ]);
    });

    it("filters overseas and Indian players", () => {
      expect(ids({ overseas: "true" }).sort()).toEqual([
        "ben-stokes",
        "chris-lynn",
        "fazal-khan",
      ]);
      expect(ids({ overseas: "false" })).toHaveLength(4);
    });

    it("filters capped and uncapped players", () => {
      expect(ids({ capped: "false" }).sort()).toEqual([
        "amit-kumar",
        "amit-kumar-2",
        "deepak-rao",
      ]);
      expect(ids({ capped: "true" })).toHaveLength(4);
    });

    it("filters by batting hand", () => {
      expect(ids({ battingHand: "left" }).sort()).toEqual([
        "ben-stokes",
        "elan-singh",
        "fazal-khan",
      ]);
    });

    it("matches any of several bowling styles", () => {
      expect(ids({ bowlingStyle: "leg-spin,off-spin" }).sort()).toEqual([
        "amit-kumar-2",
        "deepak-rao",
      ]);
    });

    it("filters an inclusive base-price range", () => {
      expect(ids({ minBase: "75", maxBase: "150" }).sort()).toEqual([
        "chris-lynn",
        "elan-singh",
      ]);
      expect(ids({ minBase: "200" })).toHaveLength(2);
      expect(ids({ maxBase: "30" })).toHaveLength(3);
    });

    it("combines filters with AND", () => {
      expect(ids({ overseas: "true", role: "bowler" })).toEqual(["fazal-khan"]);
    });

    it("returns an empty page when nothing matches", () => {
      expect(queryPool(db, PoolQuerySchema.parse({ search: "zzz" }))).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
      });
    });
  });

  describe("pagination", () => {
    it("splits results into pages that never repeat or skip rows", () => {
      const pages = [1, 2, 3].map((page) =>
        ids({ sort: "name", pageSize: "3", page: String(page) }),
      );
      expect(pages.map((page) => page.length)).toEqual([3, 3, 1]);
      expect(pages.flat()).toEqual(ids({ sort: "name" }));
    });

    it("reports the total and an empty page past the end", () => {
      const page = queryPool(
        db,
        PoolQuerySchema.parse({ page: "4", pageSize: "3" }),
      );
      expect(page).toMatchObject({ items: [], total: 7, page: 4, pageSize: 3 });
    });
  });
});
