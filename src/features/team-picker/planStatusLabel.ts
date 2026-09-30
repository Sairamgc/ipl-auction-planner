import type { PlanStatus } from "@/domain";

/** "Not started", "1 target", "3 targets". */
export function planStatusLabel(status: PlanStatus): string {
  if (status.kind === "not-started") return "Not started";
  return status.targetCount === 1
    ? "1 target"
    : `${String(status.targetCount)} targets`;
}
