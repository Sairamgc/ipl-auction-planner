import {
  type MaxSafeBidView,
  maxSafeBidView,
  type PlanNote,
  planNote,
  type PlanSummary,
  planWarnings,
  type PlanWarning,
  summarisePlan,
} from "@/domain";
import { useSquadPlan } from "@/features/plan";
import type { Franchise, SquadRules } from "@shared/contracts";
import { useMemo } from "react";

export interface SummaryView {
  franchise: Franchise;
  rules: SquadRules;
  summary: PlanSummary;
  warnings: PlanWarning[];
  note: PlanNote | null;
  maxSafeBid: MaxSafeBidView;
  /** Other franchises, highest official purse first (UI50). */
  rivals: Franchise[];
  /** Targets not counted because their player can't be found. */
  unknownCount: number;
}

export type SummaryViewState =
  | { status: "loading" }
  | { status: "error"; retry: () => void }
  | ({ status: "ready" } & SummaryView);

/**
 * Everything the summary shows, derived from the plan as shown (including
 * optimistic changes and rollbacks); nothing is stored.
 */
export function useSummaryView(teamId: string): SummaryViewState {
  const squad = useSquadPlan(teamId);
  const ready = squad.status === "ready" ? squad : null;
  const baseline = ready?.baseline;
  const resolved = ready?.resolved;
  const franchise = ready?.franchise;
  const franchises = ready?.franchises;
  const unknownCount = ready?.unknown.length ?? 0;

  const view = useMemo((): SummaryView | null => {
    if (!baseline || !resolved || !franchise || !franchises) return null;
    const { rules } = baseline;
    const summary = summarisePlan(baseline, resolved);
    const warnings = planWarnings(summary, rules);
    return {
      franchise,
      rules,
      summary,
      warnings,
      note: planNote(summary, rules),
      maxSafeBid: maxSafeBidView(summary, warnings, rules),
      rivals: franchises
        .filter((other) => other.id !== franchise.id)
        .sort(
          (a, b) =>
            b.purseRemainingLakh - a.purseRemainingLakh ||
            a.name.localeCompare(b.name),
        ),
      unknownCount,
    };
  }, [baseline, resolved, franchise, franchises, unknownCount]);

  if (squad.status === "error") return squad;
  if (!view) return { status: "loading" };
  return { status: "ready", ...view };
}
