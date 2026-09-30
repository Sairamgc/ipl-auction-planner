import type { Plan } from "@shared/contracts";

import { isOverseas } from "./overseas";
import type { SquadBaseline } from "./types";

/** Baseline figures after retentions, before any plan (D15). */
export interface BaselineFigures {
  purseLakh: number;
  openSlots: number;
  openOverseasSlots: number;
}

export type PlanStatus =
  { kind: "not-started" } | { kind: "in-progress"; targetCount: number };

export interface PickerPreview extends BaselineFigures {
  planStatus: PlanStatus;
}

/** Used by the picker cards and the workspace header. */
export function baselineFigures(baseline: SquadBaseline): BaselineFigures {
  const { rules, retained } = baseline;
  const overseas = retained.filter((p) => isOverseas(p.nationality)).length;
  return {
    purseLakh: baseline.purseLakh,
    openSlots: Math.max(0, rules.maxSquadSize - retained.length),
    openOverseasSlots: Math.max(0, rules.maxOverseas - overseas),
  };
}

export function planStatus(plan: Pick<Plan, "targets">): PlanStatus {
  return plan.targets.length === 0
    ? { kind: "not-started" }
    : { kind: "in-progress", targetCount: plan.targets.length };
}

export function pickerPreview(
  baseline: SquadBaseline,
  plan: Pick<Plan, "targets">,
): PickerPreview {
  return { ...baselineFigures(baseline), planStatus: planStatus(plan) };
}
