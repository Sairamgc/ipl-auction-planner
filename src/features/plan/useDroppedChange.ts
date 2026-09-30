import {
  useAuctionEntries,
  usePlan,
  usePlanSaveStatus,
  usePlayers,
  useSavePlan,
} from "@/api";
import {
  applyChange,
  containsChange,
  diffTargets,
  type PlanChange,
} from "@/domain";
import { useCallback, useEffect, useMemo } from "react";

import { useDroppedChangeStore } from "./droppedChangeStore";

export interface DroppedChangeView {
  change: PlanChange;
  /** Player name per auction entry id, for the message. */
  names: ReadonlyMap<string, string>;
  /** Re-applies the dropped change on top of the current plan. */
  retry: () => void;
  dismiss: () => void;
}

/**
 * The change a failed save dropped (UI54): recorded when the save fails,
 * shown until dismissed, re-applied with Try again, or found in a plan the
 * server has confirmed. A later unrelated save no longer hides it.
 */
export function useDroppedChange(teamId: string): DroppedChangeView | null {
  const status = usePlanSaveStatus(teamId);
  const plan = usePlan(teamId);
  const save = useSavePlan(teamId);
  const dropped = useDroppedChangeStore((state) => state.byTeam[teamId]);
  const record = useDroppedChangeStore((state) => state.record);
  const clear = useDroppedChangeStore((state) => state.clear);
  const entries = useAuctionEntries();
  const players = usePlayers();

  const failure = status.state === "error" ? status : null;
  useEffect(() => {
    if (!failure) return;
    record(
      teamId,
      failure.failedAt,
      diffTargets(failure.rolledBackTo ?? [], failure.failedTargets),
    );
  }, [failure, record, teamId]);

  const targets = plan.data?.targets;
  const resolved =
    dropped !== undefined &&
    status.state === "saved" &&
    targets !== undefined &&
    containsChange(targets, dropped.change);
  useEffect(() => {
    if (resolved) clear(teamId);
  }, [resolved, clear, teamId]);

  const names = useMemo(() => {
    const playerNames = new Map(players.data?.map((p) => [p.id, p.name]));
    return new Map(
      entries.data?.map((entry) => [
        entry.id,
        playerNames.get(entry.playerId) ?? entry.id,
      ]),
    );
  }, [entries.data, players.data]);

  const change = dropped?.change;
  const retry = useCallback(() => {
    if (change && targets) save(applyChange(targets, change));
  }, [change, targets, save]);
  const dismiss = useCallback(() => {
    clear(teamId);
  }, [clear, teamId]);

  if (!change || resolved) return null;
  return { change, names, retry, dismiss };
}
