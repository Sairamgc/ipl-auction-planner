import { Money } from "@/components/common/Money";
import { sortDescription, type SortOption } from "@/domain";
import { cn } from "@/lib/utils";
import type { PoolRow } from "@shared/contracts";

import { PlayerTrigger } from "./PlayerTrigger";
import { rowSummary } from "./rowDetails";

interface PoolListProps {
  rows: PoolRow[];
  /** Named with the sort, like the table's caption (UI35). */
  sort: SortOption;
  auctionDate: string | undefined;
  busy: boolean;
  onOpen: (row: PoolRow, trigger: HTMLElement) => void;
}

/** The pool on mobile: one row per player (UI25). */
export function PoolList({
  rows,
  sort,
  auctionDate,
  busy,
  onOpen,
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
          <Money lakh={row.basePriceLakh} className="font-medium" />
        </li>
      ))}
    </ul>
  );
}
