import { useAuction, useFranchises, usePlayers, useRetentions } from "@/api";
import { type BaselineFigures, baselineFigures, squadBaseline } from "@/domain";
import type { Franchise } from "@shared/contracts";
import { useMemo } from "react";

export type WorkspaceTeamState =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | { status: "not-found" }
  | {
      status: "ready";
      franchise: Franchise;
      /** Every franchise, alphabetical, for the switcher (UI6). */
      franchises: Franchise[];
      /** Null while the auction, retentions or players are loading. */
      figures: BaselineFigures | null;
    };

/** The workspace's team and its baseline figures (D15). */
export function useWorkspaceTeam(teamId: string): WorkspaceTeamState {
  const franchises = useFranchises();
  const auction = useAuction();
  const retentions = useRetentions();
  const players = usePlayers();

  const sorted = useMemo(
    () =>
      franchises.data?.toSorted((a, b) => a.name.localeCompare(b.name, "en")),
    [franchises.data],
  );
  const franchise = sorted?.find((candidate) => candidate.id === teamId);

  const figures = useMemo(() => {
    if (!franchise || !auction.data || !retentions.data || !players.data) {
      return null;
    }
    const playersById = new Map(players.data.map((p) => [p.id, p]));
    return baselineFigures(
      squadBaseline(
        franchise,
        auction.data.rules,
        retentions.data,
        playersById,
      ),
    );
  }, [franchise, auction.data, retentions.data, players.data]);

  const queries = [franchises, auction, retentions, players];
  if (queries.some((query) => query.isError)) {
    return {
      status: "error",
      retry: () => {
        for (const query of queries) {
          if (query.isError) void query.refetch();
        }
      },
    };
  }
  if (!sorted) return { status: "loading" };
  if (!franchise) return { status: "not-found" };
  return { status: "ready", franchise, franchises: sorted, figures };
}
