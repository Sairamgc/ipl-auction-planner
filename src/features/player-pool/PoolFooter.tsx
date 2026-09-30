import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

interface PoolFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
  /** Polite announcement, e.g. "25 more players loaded". */
  announcement: string;
  /** "All 98 players shown" once a multi-page list is complete (UI59). */
  endMessage: string;
}

/**
 * Below the rows: "Loading more", the load-more error with retry, the
 * "Load more" button (I3), or the end-of-list message (UI59). The sentinel
 * (ref) triggers auto-load (A7).
 */
export const PoolFooter = forwardRef<HTMLDivElement, PoolFooterProps>(
  function PoolFooter(
    {
      hasNextPage,
      isFetchingNextPage,
      isFetchNextPageError,
      onLoadMore,
      announcement,
      endMessage,
    },
    sentinelRef,
  ) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-4 text-sm">
        <p role="status" className="sr-only">
          {announcement}
        </p>
        {isFetchingNextPage ? (
          <p role="status" className="text-muted-foreground">
            Loading more players…
          </p>
        ) : isFetchNextPageError ? (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-center gap-3 text-destructive-subtle-foreground"
          >
            Couldn't load more players.
            <Button variant="outline" size="sm" onClick={onLoadMore}>
              Try again
            </Button>
          </div>
        ) : (
          hasNextPage && (
            <Button variant="outline" onClick={onLoadMore}>
              Load more
            </Button>
          )
        )}
        {/* Always mounted, so the message is announced when it appears */}
        <p
          role="status"
          className={endMessage ? "text-muted-foreground" : "sr-only"}
        >
          {endMessage}
        </p>
        {hasNextPage && !isFetchNextPageError && (
          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
        )}
      </div>
    );
  },
);
