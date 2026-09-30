import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { formatDate } from "@/domain";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

import { TeamCard } from "./TeamCard";
import { TeamCardSkeleton } from "./TeamCardSkeleton";
import { useTeamPicker } from "./useTeamPicker";

const SKELETON_COUNT = 4; // one desktop row
const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"; // UI2

/** `/`: choose a franchise to plan for (P3, §3). */
export function TeamPickerPage() {
  const state = useTeamPicker();
  useDocumentTitle("Choose a team");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Choose a team to plan for</h1>
        {state.status === "success" && (
          <p className="text-muted-foreground">
            {state.auction.name} · {formatDate(state.auction.auctionDate)}
          </p>
        )}
      </div>

      {state.status === "loading" && (
        <>
          <p role="status" className="sr-only">
            Loading teams…
          </p>
          <ul aria-label="Teams" aria-busy="true" className={GRID}>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <li key={index}>
                <TeamCardSkeleton />
              </li>
            ))}
          </ul>
        </>
      )}

      {state.status === "error" && (
        <ErrorState
          title="Couldn't load teams."
          description="Check your connection and try again."
          onRetry={state.retry}
          className="max-w-xl"
        />
      )}

      {state.status === "success" &&
        (state.cards.length === 0 ? (
          <EmptyState title="No teams available yet." className="max-w-xl" />
        ) : (
          <ul aria-label="Teams" className={GRID}>
            {state.cards.map((card) => (
              <li key={card.franchise.id}>
                <TeamCard {...card} />
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
