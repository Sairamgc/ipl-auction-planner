import {
  type Auction,
  type AuctionEntry,
  type Franchise,
  type Plan,
  type Player,
  PoolQuerySchema,
  type Retention,
} from "@shared/contracts";

import { queryPool } from "../../mock-server/routes/pool";

import { makePlayer, makePlayers } from "./factories";
import { jsonResponse, mockFetch } from "./query";

export const auction: Auction = {
  id: "ipl-2026",
  name: "IPL 2026 Player Auction",
  season: 2026,
  auctionDate: "2025-12-16",
  rules: {
    minSquadSize: 18,
    maxSquadSize: 25,
    maxOverseas: 8,
    lowestBasePriceLakh: 30,
  },
};

export const csk: Franchise = {
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

export const rcb: Franchise = {
  id: "rcb",
  name: "Royal Challengers Bengaluru",
  shortName: "RCB",
  purseRemainingLakh: 1640,
  colors: {
    primary: "#C90C13",
    onPrimary: "#FFFFFF",
    secondary: "#E7C641",
    onSecondary: "#101612",
  },
};

// Squads shaped like the real pre-auction ones: CSK 16 retained (4
// overseas), RCB 17 retained (6 overseas)
const cskPlayers = [
  ...makePlayers(12),
  ...makePlayers(4, { nationality: "AUS" }),
];
const rcbPlayers = [
  ...makePlayers(11),
  ...makePlayers(6, { nationality: "ENG" }),
];

/**
 * 30 pool players: enough for two 25-row pages. A few are named for
 * readable tests; the rest vary role, nationality, status and base price.
 */
export const poolPlayers: Player[] = [
  makePlayer({
    id: "cameron-green",
    name: "Cameron Green",
    dateOfBirth: "1999-06-03",
    nationality: "AUS",
    role: "batter",
    bowlingStyle: "right-arm-fast",
  }),
  makePlayer({
    id: "kartik-sharma",
    name: "Kartik Sharma",
    dateOfBirth: "2006-04-26",
    role: "wicketkeeper",
    isCapped: false,
  }),
  makePlayer({
    id: "ravi-bishnoi",
    name: "Ravi Bishnoi",
    dateOfBirth: "2000-09-05",
    role: "bowler",
    bowlingStyle: "leg-spin",
  }),
  makePlayer({
    id: "jacob-duffy",
    name: "Jacob Duffy",
    dateOfBirth: "1994-08-02",
    nationality: "NZ",
    role: "bowler",
    bowlingStyle: "right-arm-fast",
  }),
  ...Array.from({ length: 26 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return makePlayer({
      id: `pool-player-${number}`,
      name: `Pool Player ${number}`,
      dateOfBirth: `19${String(90 + (index % 10))}-01-15`,
      nationality: index % 3 === 0 ? "ENG" : "IND",
      role: (["batter", "bowler", "all-rounder", "wicketkeeper"] as const)[
        index % 4
      ],
      isCapped: index % 5 !== 0,
    });
  }),
];

const BASES = [200, 150, 100, 75, 30];
export const poolEntries: AuctionEntry[] = poolPlayers.map((player, index) => ({
  id: `2026-${player.id}`,
  playerId: player.id,
  basePriceLakh:
    index < 4 ? ([200, 30, 200, 200][index] ?? 30) : (BASES[index % 5] ?? 30),
}));

export const players: Player[] = [...cskPlayers, ...rcbPlayers, ...poolPlayers];

export const retentions: Retention[] = [
  ...cskPlayers.map((p) => ({ franchiseId: "csk", playerId: p.id })),
  ...rcbPlayers.map((p) => ({ franchiseId: "rcb", playerId: p.id })),
];

export function emptyPlan(franchiseId: string): Plan {
  return { id: franchiseId, franchiseId, targets: [], updatedAt: null };
}

/** A response per path: a body, an HTTP status, a promise, or a function. */
export type ApiResponses = Record<string, unknown>;

/** `/api/pool` answered by the mock server's own query logic. */
export function poolResponse(url: URL): Response {
  const query = PoolQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!query.success) return jsonResponse({ error: "Invalid pool query" }, 400);
  return jsonResponse(
    queryPool({ players, auctionEntries: poolEntries }, query.data),
  );
}

/** GET responses by path, as the mock server would serve them. */
export function defaultResponses(): ApiResponses {
  return {
    "/api/auction": auction,
    // Deliberately not alphabetical: the picker sorts
    "/api/franchises": [rcb, csk],
    "/api/retentions": retentions,
    "/api/players": players,
    "/api/plans": [emptyPlan("csk"), emptyPlan("rcb")],
    "/api/pool": poolResponse,
  };
}

/**
 * Stubs fetch with the given responses. A path mapped to a number answers
 * with that HTTP status; a path mapped to a promise waits for it.
 */
export function mockApi(responses: ApiResponses = defaultResponses()) {
  return mockFetch((url) => {
    const body = responses[url.pathname];
    if (typeof body === "function") {
      return (body as (url: URL) => Response | Promise<Response>)(url);
    }
    if (body instanceof Promise) return body as Promise<Response>;
    if (typeof body === "number") return jsonResponse({ error: "x" }, body);
    return body === undefined
      ? jsonResponse({ error: "Not found" }, 404)
      : jsonResponse(body);
  });
}
