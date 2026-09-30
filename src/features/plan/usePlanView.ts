import { groupSquadByRole, type RoleGroup } from "@/domain";
import type { Target } from "@shared/contracts";
import { useMemo } from "react";

import { useSquadPlan } from "./useSquadPlan";

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
  const squad = useSquadPlan(teamId);
  const baseline = squad.status === "ready" ? squad.baseline : null;
  const resolved = squad.status === "ready" ? squad.resolved : null;
  const groups = useMemo(
    () =>
      baseline && resolved
        ? groupSquadByRole(baseline.retained, resolved)
        : null,
    [baseline, resolved],
  );

  if (squad.status !== "ready" || !groups) {
    return squad.status === "error" ? squad : { status: "loading" };
  }
  return {
    status: "ready",
    targets: squad.targets,
    groups,
    unknown: squad.unknown,
    auctionDate: squad.auctionDate,
  };
}
