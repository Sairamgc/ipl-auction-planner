import { Button } from "@/components/ui/button";
import { forwardRef } from "react";

interface PoolFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
  /** Polite announcement, e.g. "25 more players loaded". */
  announcement: string;
}

/**
 * Below the rows: "Loading more", the load-more error with retry, or the
 * "Load more" button (I3). The sentinel (ref) triggers auto-load (A7).
 */
export const PoolFooter = forwardRef<HTMLDivElement, PoolFooterProps>(
  function PoolFooter(
    {
      hasNextPage,
      isFetchingNextPage,
      isFetchNextPageError,
      onLoadMore,
      announcement,
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
        {hasNextPage && !isFetchNextPageError && (
          <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
        )}
      </div>
    );
  },
);
