import { useAuction, usePool } from "@/api";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { sortOptionFor } from "@/domain";
import { openPlayerDetail } from "@/features/player-detail";
import { useElementHeight } from "@/lib/useElementHeight";
import { cn } from "@/lib/utils";
import type { PoolRow } from "@shared/contracts";
import { useCallback, useEffect, useRef, useState } from "react";

import { ActiveFilterChips } from "./ActiveFilterChips";
import { PoolFooter } from "./PoolFooter";
import { PoolList } from "./PoolList";
import { PoolSkeleton } from "./PoolSkeleton";
import { PoolTable } from "./PoolTable";
import { PoolToolbar } from "./PoolToolbar";
import { activeFilterCount } from "./poolSearch";
import { usePoolSearch } from "./usePoolSearch";

interface PoolPanelProps {
  /** `wide` desktop table, `narrow` tablet table, `list` mobile (UI25). */
  layout: "wide" | "narrow" | "list";
  /** Scrolls on its own (tablet and desktop, UI12, UI20). */
  scrollable?: boolean;
}

function playersLabel(count: number) {
  return `${String(count)} ${count === 1 ? "player" : "players"}`;
}

/**
 * The auction pool (§3): server-side search, filters and sort from the URL,
 * infinite scroll with "Load more", and rows that open the detail dialog.
 */
export function PoolPanel({ layout, scrollable = false }: PoolPanelProps) {
  const { search, filters, update, clearFilters } = usePoolSearch();
  const pool = usePool(filters);
  const auction = useAuction();
  const auctionDate = auction.data?.auctionDate;
  const sort = sortOptionFor(filters.sort, filters.order);

  const panelRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topHeight = useElementHeight(topRef);
  const [announcement, setAnnouncement] = useState("");

  const rows = pool.data?.pages.flatMap((page) => page.items) ?? [];
  const total = pool.data?.pages[0]?.total ?? null;
  const busy = pool.isPlaceholderData;
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError } = pool;

  // Changing filters or sort starts again from the top (§9)
  const filtersKey = JSON.stringify(filters);
  const shownFilters = useRef(filtersKey);
  useEffect(() => {
    if (shownFilters.current === filtersKey) return;
    shownFilters.current = filtersKey;
    if (scrollable) panelRef.current?.scrollTo({ top: 0 });
  }, [filtersKey, scrollable]);

  // Auto-load near the end, never after a failed page (A7)
  const { fetchNextPage } = pool;
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Join a request already in flight instead of restarting it
        if (entry?.isIntersecting) void fetchNextPage({ cancelRefetch: false });
      },
      {
        root: scrollable ? panelRef.current : null,
        rootMargin: "0px 0px 240px 0px",
      },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, scrollable, hasNextPage, isFetchNextPageError]);

  // "Load more" moves focus to the first new row and announces it (UI31)
  const loadMore = useCallback(async () => {
    const before = rows.length;
    const result = await fetchNextPage({ cancelRefetch: false });
    if (result.isError) return;
    const after =
      result.data?.pages.reduce((sum, page) => sum + page.items.length, 0) ??
      before;
    setAnnouncement(`${playersLabel(after - before)} more loaded`);
    requestAnimationFrame(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          `[data-pool-index="${String(before)}"] [data-player-trigger]`,
        )
        ?.focus();
    });
  }, [fetchNextPage, rows.length]);

  const openDetail = useCallback((row: PoolRow, trigger: HTMLElement) => {
    openPlayerDetail({
      player: row.player,
      basePriceLakh: row.basePriceLakh,
      returnFocusTo: trigger,
    });
  }, []);

  let body;
  if (pool.isPending) {
    body = (
      <>
        <p role="status" className="sr-only">
          Loading players…
        </p>
        <PoolSkeleton />
      </>
    );
  } else if (pool.isError && rows.length === 0) {
    body = (
      <div className="p-4">
        <ErrorState
          title="Couldn't load players."
          description="Check your connection and try again."
          announce="alert"
          onRetry={() => void pool.refetch()}
        />
      </div>
    );
  } else if (rows.length === 0) {
    const filtered = activeFilterCount(search) > 0 || Boolean(search.search);
    body = (
      <div className="p-4">
        <EmptyState
          title={
            filtered
              ? "No players match these filters."
              : "No players in the pool."
          }
        >
          {filtered && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </EmptyState>
      </div>
    );
  } else {
    body = (
      <>
        {layout === "list" ? (
          <PoolList
            rows={rows}
            sort={sort}
            auctionDate={auctionDate}
            busy={busy}
            onOpen={openDetail}
          />
        ) : (
          <PoolTable
            rows={rows}
            layout={layout}
            sort={sort}
            auctionDate={auctionDate}
            stickyTop={scrollable ? topHeight : null}
            busy={busy}
            onOpen={openDetail}
          />
        )}
        <PoolFooter
          ref={sentinelRef}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={() => void loadMore()}
          announcement={announcement}
        />
      </>
    );
  }

  return (
    <section
      ref={panelRef}
      aria-labelledby="pool-heading"
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "flex flex-col rounded-lg border bg-card",
        scrollable &&
          "min-h-0 overflow-y-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <div
        ref={topRef}
        className={cn("border-b bg-card", scrollable && "sticky top-0 z-[2]")}
      >
        <h2 id="pool-heading" className="px-4 pt-3 text-base font-semibold">
          Player pool
        </h2>
        <PoolToolbar
          search={search}
          sort={sort}
          update={update}
          onClearAll={clearFilters}
          filtersIn={layout === "list" ? "sheet" : "popover"}
          total={busy ? null : total}
        />
        <ActiveFilterChips
          search={search}
          update={update}
          onClearAll={clearFilters}
        />
        {/* Updating bar while the previous results are shown (UI28) */}
        <div
          aria-hidden="true"
          className={cn(
            "h-0.5 bg-primary transition-opacity",
            busy ? "animate-pulse opacity-100" : "opacity-0",
          )}
        />
      </div>
      {total !== null && (
        // Dimming is visual only: this polite status also tells screen
        // readers when an update starts and what it found (UI28)
        <p role="status" className="px-4 pt-2 text-xs text-muted-foreground">
          {busy ? "Updating results…" : playersLabel(total)}
        </p>
      )}
      {body}
    </section>
  );
}
