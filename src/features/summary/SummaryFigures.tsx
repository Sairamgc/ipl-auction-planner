import { Money } from "@/components/common/Money";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { summaryBarLabel } from "./summaryText";
import { type SummaryViewState, useSummaryView } from "./useSummaryView";

interface Figure {
  label: string;
  value: ReactNode;
}

function figuresOf(view: SummaryViewState): Figure[] {
  const labels = ["Purse left", "Max safe bid", "Warnings"];
  if (view.status !== "ready") {
    return labels.map((label) => ({
      label,
      value:
        view.status === "loading" ? (
          <Skeleton className="inline-block h-4 w-12 align-middle" />
        ) : (
          <>
            <span aria-hidden="true">—</span>
            <span className="sr-only">unavailable</span>
          </>
        ),
    }));
  }
  const { summary, maxSafeBid, warnings } = view;
  const unsafe = maxSafeBid.reason.code === "unsafe";
  return [
    {
      label: "Purse left",
      value: <Money lakh={summary.remainingLakh} className="font-semibold" />,
    },
    {
      label: "Max safe bid",
      value: (
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold",
            unsafe && "text-warning-subtle-foreground",
          )}
        >
          {unsafe && (
            <TriangleAlert
              aria-hidden="true"
              className="size-3.5 text-warning"
            />
          )}
          <Money lakh={maxSafeBid.displayedLakh} />
          {unsafe && <span className="sr-only">, not enough purse left</span>}
        </span>
      ),
    },
    {
      label: "Warnings",
      value:
        warnings.length === 0 ? (
          <span className="font-semibold">None</span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-warning-subtle-foreground">
            <TriangleAlert
              aria-hidden="true"
              className="size-3.5 text-warning"
            />
            {warnings.length}
          </span>
        ),
    },
  ];
}

/**
 * The plan's headline figures for the tablet strip (a description list).
 */
export function SummaryFigures({ className }: { className?: string }) {
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const figures = figuresOf(useSummaryView(teamId));
  return (
    <dl className={cn("flex flex-wrap gap-x-5 gap-y-1 text-sm", className)}>
      {figures.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The mobile bar's content: one button that opens the Summary tab, named
 * with the live figures (UI49). `onOpen` is left out for the inert spacer.
 */
export function SummaryBarButton({ onOpen }: { onOpen?: () => void }) {
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const view = useSummaryView(teamId);
  const figures = figuresOf(view);
  const label =
    view.status === "loading"
      ? "Plan summary loading. Open summary"
      : summaryBarLabel(
          view.status === "ready"
            ? {
                remainingLakh: view.summary.remainingLakh,
                maxSafeBid: view.maxSafeBid,
                warningCount: view.warnings.length,
              }
            : null,
        );
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onOpen}
      className="flex touch-target w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-md text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {figures.map(({ label: figureLabel, value }) => (
        <span key={figureLabel} className="flex items-baseline gap-1.5">
          <span className="text-muted-foreground">{figureLabel}</span>
          {value}
        </span>
      ))}
    </button>
  );
}
