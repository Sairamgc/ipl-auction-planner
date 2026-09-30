import {
  createTestQueryClient,
  createWrapper,
  jsonResponse,
  mockFetch,
  urlOf,
} from "@/test/query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { auctionQueryOptions, useAuction } from "./auction";
import {
  auctionEntriesQueryOptions,
  useAuctionEntries,
} from "./auctionEntries";
import {
  franchisesQueryOptions,
  useFranchise,
  useFranchises,
} from "./franchises";
import { playersQueryOptions, usePlayers } from "./players";
import { retentionsQueryOptions, useRetentions } from "./retentions";

const auction = {
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
const csk = {
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
const player = {
  id: "ms-dhoni",
  name: "MS Dhoni",
  dateOfBirth: "1981-07-07",
  nationality: "IND",
  role: "wicketkeeper",
  battingHand: "right",
  bowlingStyle: "right-arm-medium",
  isCapped: false,
};

const responses: Record<string, unknown> = {
  "/api/auction": auction,
  "/api/franchises": [{ ...csk, sponsor: "ignored" }],
  "/api/players": [player],
  "/api/retentions": [{ franchiseId: "csk", playerId: "ms-dhoni" }],
  "/api/auctionEntries": [
    { id: "2026-cameron-green", playerId: "cameron-green", basePriceLakh: 200 },
  ],
};

function setup() {
  const fetchMock = mockFetch((url) =>
    jsonResponse(responses[url.pathname], responses[url.pathname] ? 200 : 404),
  );
  return { fetchMock, wrapper: createWrapper(createTestQueryClient()) };
}

describe("read-only resources", () => {
  it.each([
    ["auction", useAuction, "/api/auction"],
    ["players", usePlayers, "/api/players"],
    ["retentions", useRetentions, "/api/retentions"],
    ["auction entries", useAuctionEntries, "/api/auctionEntries"],
  ] as const)("fetches and validates %s", async (_name, useResource, path) => {
    const { fetchMock, wrapper } = setup();
    const { result } = renderHook(() => useResource(), { wrapper });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(responses[path]);
    expect(
      fetchMock.mock.calls.map(([input]) => urlOf(input).pathname),
    ).toEqual([path]);
  });

  it("drops unknown fields from responses instead of failing (N9)", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useFranchises(), { wrapper });
    await waitFor(() => {
      expect(result.current.data).toEqual([csk]);
    });
  });

  it("selects one franchise from the cached list", async () => {
    const { fetchMock, wrapper } = setup();
    const { result } = renderHook(
      () => ({ found: useFranchise("csk"), missing: useFranchise("mi") }),
      { wrapper },
    );
    await waitFor(() => {
      expect(result.current.found.data).toEqual(csk);
    });
    expect(result.current.missing.data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces contract violations as errors", async () => {
    mockFetch(() => jsonResponse({ ...auction, season: "2026" }));
    const { result } = renderHook(() => useAuction(), {
      wrapper: createWrapper(createTestQueryClient()),
    });
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it.each([
    ["auction", auctionQueryOptions],
    ["franchises", franchisesQueryOptions],
    ["players", playersQueryOptions],
    ["retentions", retentionsQueryOptions],
    ["auction entries", auctionEntriesQueryOptions],
  ] as const)(
    "treats %s as never stale, without focus refetch (N4)",
    (_name, options) => {
      expect(options()).toMatchObject({
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      });
    },
  );
});
