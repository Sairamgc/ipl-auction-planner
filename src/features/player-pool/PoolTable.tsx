import { Money } from "@/components/common/Money";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, sortDescription, type SortOption } from "@/domain";
import { cn } from "@/lib/utils";
import type { PoolRow, PoolSortField } from "@shared/contracts";

import { PlayerTrigger } from "./PlayerTrigger";
import { rowAge, rowIsOverseas, rowSummary } from "./rowDetails";

interface PoolTableProps {
  rows: PoolRow[];
  /** `wide`: desktop columns; `narrow`: tablet, two columns (UI25). */
  layout: "wide" | "narrow";
  sort: SortOption;
  auctionDate: string | undefined;
  /** Offset for the sticky header, below the panel's sticky toolbar. */
  stickyTop: number | null;
  busy: boolean;
  onOpen: (row: PoolRow, trigger: HTMLElement) => void;
}

function ariaSort(column: PoolSortField, sort: SortOption) {
  if (column !== sort.sort) return undefined;
  return sort.order === "asc" ? "ascending" : "descending";
}

/** The pool as a semantic table (Q2: no table or virtualisation library). */
export function PoolTable({
  rows,
  layout,
  sort,
  auctionDate,
  stickyTop,
  busy,
  onOpen,
}: PoolTableProps) {
  const wide = layout === "wide";
  const headerClass = cn(
    "bg-card px-2 py-2 text-left text-xs font-medium text-muted-foreground",
    stickyTop !== null && "sticky z-[1] shadow-[inset_0_-1px_var(--border)]",
  );
  const headerStyle =
    stickyTop !== null ? { top: `${String(stickyTop)}px` } : undefined;

  return (
    <table
      aria-busy={busy || undefined}
      className={cn("w-full text-sm transition-opacity", busy && "opacity-60")}
    >
      <caption className="sr-only">
        Auction pool, {sortDescription(sort)}
      </caption>
      <thead>
        <tr>
          <th
            scope="col"
            aria-sort={ariaSort("name", sort)}
            style={headerStyle}
            className={cn(headerClass, "pl-4")}
          >
            Player
          </th>
          {wide && (
            <>
              <th scope="col" style={headerStyle} className={headerClass}>
                Role
              </th>
              <th
                scope="col"
                aria-sort={ariaSort("age", sort)}
                style={headerStyle}
                className={cn(headerClass, "text-right")}
              >
                Age
              </th>
            </>
          )}
          <th
            scope="col"
            aria-sort={ariaSort("basePrice", sort)}
            style={headerStyle}
            className={cn(headerClass, "pr-4 text-right")}
          >
            Base price
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.id}
            data-pool-index={index}
            className="relative border-b last:border-b-0 hover:bg-muted/60"
          >
            <th scope="row" className="py-2 pr-2 pl-4 text-left font-normal">
              <PlayerTrigger row={row} onOpen={onOpen} />
              {wide ? (
                <span className="ml-2 inline-flex gap-1 align-middle">
                  {rowIsOverseas(row) && (
                    <Badge variant="outline">Overseas</Badge>
                  )}
                  {!row.player.isCapped && (
                    <Badge variant="outline">Uncapped</Badge>
                  )}
                </span>
              ) : (
                <span className="block text-xs text-muted-foreground">
                  {rowSummary(row, auctionDate)}
                </span>
              )}
            </th>
            {wide && (
              <>
                <td className="px-2 py-2">{ROLE_LABELS[row.player.role]}</td>
                <td className="px-2 py-2 text-right">
                  {rowAge(row, auctionDate) ?? "—"}
                </td>
              </>
            )}
            <td className="py-2 pr-4 pl-2 text-right font-medium">
              <Money lakh={row.basePriceLakh} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
