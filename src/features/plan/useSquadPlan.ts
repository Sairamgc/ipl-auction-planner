import {
  useAuction,
  useAuctionEntries,
  useFranchises,
  usePlan,
  usePlayers,
  useRetentions,
} from "@/api";
import {
  type PlannedTarget,
  plannedTargets,
  type SquadBaseline,
  squadBaseline,
} from "@/domain";
import type { Franchise, Target } from "@shared/contracts";
import { useMemo } from "react";

export interface SquadPlan {
  franchise: Franchise;
  /** Every franchise, for rival purses (P12). */
  franchises: Franchise[];
  baseline: SquadBaseline;
  /** The stored plan's targets, for edits. */
  targets: Target[];
  /** Targets resolved to their player and base price. */
  resolved: PlannedTarget[];
  /** Targets whose player can't be found (data problem): still removable. */
  unknown: Target[];
  auctionDate: string;
}

export type SquadPlanState =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | ({ status: "ready" } & SquadPlan);

/**
 * A franchise's squad as planned: its baseline after retentions plus the
 * plan's targets. Reads the plan's query cache, so optimistic saves and
 * rollbacks show here at once. Shared by the plan and summary panels.
 */
export function useSquadPlan(teamId: string): SquadPlanState {
  const plan = usePlan(teamId);
  const entries = useAuctionEntries();
  const players = usePlayers();
  const retentions = useRetentions();
  const franchises = useFranchises();
  const auction = useAuction();

  const squad = useMemo((): SquadPlan | null => {
    const franchise = franchises.data?.find((f) => f.id === teamId);
    if (!plan.data || !entries.data || !players.data || !retentions.data) {
      return null;
    }
    if (!franchises.data || !franchise || !auction.data) return null;
    const playersById = new Map(players.data.map((p) => [p.id, p]));
    const entriesById = new Map(entries.data.map((e) => [e.id, e]));
    const { resolved, unknown } = plannedTargets(
      plan.data.targets,
      entriesById,
      playersById,
    );
    return {
      franchise,
      franchises: franchises.data,
      baseline: squadBaseline(
        franchise,
        auction.data.rules,
        retentions.data,
        playersById,
      ),
      targets: plan.data.targets,
      resolved,
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
  if (!squad) return { status: "loading" };
  return { status: "ready", ...squad };
}
