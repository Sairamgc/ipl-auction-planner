import { mergeChanges, type PlanChange } from "@/domain";
import { create } from "zustand";

interface DroppedChange {
  change: PlanChange;
}

interface DroppedChangeState {
  /** The change a failed save dropped, per team, until resolved (UI54). */
  byTeam: Partial<Record<string, DroppedChange>>;
  /** Latest failure already recorded (or dismissed), per team. */
  handledAt: Partial<Record<string, number>>;
  record: (teamId: string, failedAt: number, change: PlanChange) => void;
  clear: (teamId: string) => void;
}

const initialState = { byTeam: {}, handledAt: {} };

/**
 * UI state: which change the user asked for but the server never stored.
 * Kept until dismissed, re-applied, or found in a saved plan, so a later
 * successful save can't hide it.
 */
export const useDroppedChangeStore = create<DroppedChangeState>()((set) => ({
  ...initialState,
  record: (teamId, failedAt, change) => {
    set((state) => {
      if ((state.handledAt[teamId] ?? -1) >= failedAt) return state;
      const earlier = state.byTeam[teamId]?.change;
      return {
        byTeam: {
          ...state.byTeam,
          [teamId]: {
            change: earlier ? mergeChanges(earlier, change) : change,
          },
        },
        handledAt: { ...state.handledAt, [teamId]: failedAt },
      };
    });
  },
  clear: (teamId) => {
    set((state) => ({ byTeam: { ...state.byTeam, [teamId]: undefined } }));
  },
}));

/** Test helper: forgets every dropped change. */
export function resetDroppedChanges() {
  useDroppedChangeStore.setState(initialState);
}
