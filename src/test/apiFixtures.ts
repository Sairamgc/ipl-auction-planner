import type {
  Auction,
  Franchise,
  Plan,
  Player,
  Retention,
} from "@shared/contracts";

import { makePlayers } from "./factories";
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

export const players: Player[] = [...cskPlayers, ...rcbPlayers];

export const retentions: Retention[] = [
  ...cskPlayers.map((p) => ({ franchiseId: "csk", playerId: p.id })),
  ...rcbPlayers.map((p) => ({ franchiseId: "rcb", playerId: p.id })),
];

export function emptyPlan(franchiseId: string): Plan {
  return { id: franchiseId, franchiseId, targets: [], updatedAt: null };
}

export type ApiResponses = Record<string, unknown>;

/** GET responses by path, as the mock server would serve them. */
export function defaultResponses(): ApiResponses {
  return {
    "/api/auction": auction,
    // Deliberately not alphabetical: the picker sorts
    "/api/franchises": [rcb, csk],
    "/api/retentions": retentions,
    "/api/players": players,
    "/api/plans": [emptyPlan("csk"), emptyPlan("rcb")],
  };
}

/**
 * Stubs fetch with the given responses. A path mapped to a number answers
 * with that HTTP status; a path mapped to a promise waits for it.
 */
export function mockApi(responses: ApiResponses = defaultResponses()) {
  return mockFetch((url) => {
    const body = responses[url.pathname];
    if (body instanceof Promise) return body as Promise<Response>;
    if (typeof body === "number") return jsonResponse({ error: "x" }, body);
    return body === undefined
      ? jsonResponse({ error: "Not found" }, 404)
      : jsonResponse(body);
  });
}
