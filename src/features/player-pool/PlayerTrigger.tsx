import type { PoolRow } from "@shared/contracts";

interface PlayerTriggerProps {
  row: PoolRow;
  onOpen: (row: PoolRow, trigger: HTMLElement) => void;
}

/**
 * The player's name as a button stretched over the whole row, so clicking
 * anywhere opens the detail dialog. Row actions sit beside it, never inside
 * it (UI30). The focus ring is drawn on the stretched area.
 */
export function PlayerTrigger({ row, onOpen }: PlayerTriggerProps) {
  return (
    <button
      type="button"
      data-player-trigger
      // Exact name in every browser: a visually hidden span would get an
      // extra space ("Green , view details") in Chromium. Starts with the
      // visible text (WCAG 2.5.3)
      aria-label={`${row.player.name}, view details`}
      onClick={(event) => {
        onOpen(row, event.currentTarget);
      }}
      className="text-left font-medium outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
    >
      {row.player.name}
    </button>
  );
}
