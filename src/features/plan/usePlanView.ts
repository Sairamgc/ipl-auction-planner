import {
  useAuction,
  useAuctionEntries,
  useFranchises,
  usePlan,
  usePlayers,
  useRetentions,
} from "@/api";
import {
  groupSquadByRole,
  plannedTargets,
  type RoleGroup,
  squadBaseline,
} from "@/domain";
import type { Target } from "@shared/contracts";
import { useMemo } from "react";

export type PlanViewState =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | {
      status: "ready";
      /** The stored plan's targets, for edits. */
      targets: Target[];
      groups: RoleGroup[];
      /** Targets whose player can't be found (data problem): still removable. */
      unknown: Target[];
      auctionDate: string;
    };

/** The plan panel's data: retained players and resolved targets by role. */
export function usePlanView(teamId: string): PlanViewState {
  const plan = usePlan(teamId);
  const entries = useAuctionEntries();
  const players = usePlayers();
  const retentions = useRetentions();
  const franchises = useFranchises();
  const auction = useAuction();

  const view = useMemo(() => {
    const franchise = franchises.data?.find((f) => f.id === teamId);
    if (!plan.data || !entries.data || !players.data || !retentions.data) {
      return null;
    }
    if (!franchise || !auction.data) return null;
    const playersById = new Map(players.data.map((p) => [p.id, p]));
    const entriesById = new Map(entries.data.map((e) => [e.id, e]));
    const baseline = squadBaseline(
      franchise,
      auction.data.rules,
      retentions.data,
      playersById,
    );
    const { resolved, unknown } = plannedTargets(
      plan.data.targets,
      entriesById,
      playersById,
    );
    return {
      targets: plan.data.targets,
      groups: groupSquadByRole(baseline.retained, resolved),
      unknown,
      auctionDate: auction.data.auctionDate,
    };
  }, [
    teamId,
    plan.data,
    entries.data,
    players.data,
    retentions.data,
    franchises.data,
    auction.data,
  ]);

  const queries = [plan, entries, players, retentions, franchises, auction];
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
  if (!view) return { status: "loading" };
  return { status: "ready", ...view };
}
