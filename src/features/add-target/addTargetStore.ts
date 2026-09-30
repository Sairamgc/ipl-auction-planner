import type { PoolRow } from "@shared/contracts";
import { create } from "zustand";

export interface AddTargetRequest {
  row: PoolRow;
  /** The Add button that opened the dialog: focus returns here on cancel. */
  opener: HTMLElement;
}

interface AddTargetState {
  request: AddTargetRequest | null;
  isOpen: boolean;
  open: (request: AddTargetRequest) => void;
  close: () => void;
}

/** UI state for the add dialog (flow 2). */
export const useAddTargetStore = create<AddTargetState>()((set) => ({
  request: null,
  isOpen: false,
  open: (request) => {
    set({ request, isOpen: true });
  },
  close: () => {
    set({ isOpen: false });
  },
}));

/** Opens the add dialog for a pool row (only from its Add button, §3). */
export function openAddTarget(request: AddTargetRequest) {
  useAddTargetStore.getState().open(request);
}
