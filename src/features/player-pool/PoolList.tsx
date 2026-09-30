import { Money } from "@/components/common/Money";
import { sortDescription, type SortOption } from "@/domain";
import { cn } from "@/lib/utils";
import type { PoolRow } from "@shared/contracts";
import type { ReactNode } from "react";

import { PlayerTrigger } from "./PlayerTrigger";
import { rowSummary } from "./rowDetails";

interface PoolListProps {
  rows: PoolRow[];
  /** Named with the sort, like the table's caption (UI35). */
  sort: SortOption;
  auctionDate: string | undefined;
  busy: boolean;
  onOpen: (row: PoolRow, trigger: HTMLElement) => void;
  /** Row action beside the name button, e.g. Add (UI30, UI34). */
  renderAction?: (row: PoolRow) => ReactNode;
}

/** The pool on mobile: one row per player (UI25). */
export function PoolList({
  rows,
  sort,
  auctionDate,
  busy,
  onOpen,
  renderAction,
}: PoolListProps) {
  return (
    <ul
      aria-label={`Players, ${sortDescription(sort)}`}
      aria-busy={busy || undefined}
      className={cn("transition-opacity", busy && "opacity-60")}
    >
      {rows.map((row, index) => (
        <li
          key={row.id}
          data-pool-index={index}
          className="relative flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <PlayerTrigger row={row} onOpen={onOpen} />
            <span className="text-xs text-muted-foreground">
              {rowSummary(row, auctionDate)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Money lakh={row.basePriceLakh} className="font-medium" />
            {renderAction && (
              <div className="relative z-[1]">{renderAction(row)}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
