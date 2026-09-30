import type { Player } from "@shared/contracts";
import { create } from "zustand";

export interface PlayerDetail {
  player: Player;
  /** Pool players only; retained players have no base price. */
  basePriceLakh?: number;
  /** Where focus goes when the dialog closes (UI29). */
  returnFocusTo?: HTMLElement | null;
}

interface PlayerDetailState {
  /** Kept after closing so the dialog can animate out. */
  detail: PlayerDetail | null;
  isOpen: boolean;
  open: (detail: PlayerDetail) => void;
  close: () => void;
}

/** UI state for the read-only player detail dialog (flow 1). */
export const usePlayerDetailStore = create<PlayerDetailState>()((set) => ({
  detail: null,
  isOpen: false,
  open: (detail) => {
    set({ detail, isOpen: true });
  },
  close: () => {
    set({ isOpen: false });
  },
}));

/** Opens the dialog from anywhere (pool rows now, plan items later). */
export function openPlayerDetail(detail: PlayerDetail) {
  usePlayerDetailStore.getState().open(detail);
}
