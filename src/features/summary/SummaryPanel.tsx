import { ErrorState } from "@/components/common/ErrorState";
import { LimitBar } from "@/components/common/LimitBar";
import { Money } from "@/components/common/Money";
import { teamColorStyle } from "@/components/common/teamColorStyle";
import { TeamLogo } from "@/components/common/TeamLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_ORDER, ROLE_PLURAL_LABELS } from "@/domain";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

import { MaxSafeBidValue } from "./MaxSafeBidValue";
import {
  maxSafeBidSentence,
  noteText,
  type StatusText,
  warningText,
} from "./summaryText";
import { type SummaryView, useSummaryView } from "./useSummaryView";

interface SummaryPanelProps {
  /** Scrolls on its own (desktop, and inside the tablet strip; UI20). */
  scrollable?: boolean;
  className?: string;
  /** Move focus to the heading once (mobile bar, UI49). */
  focusHeading?: boolean;
  onHeadingFocused?: () => void;
}

/**
 * "Summary" (§7): warnings and note, max safe bid, metrics, roles and
 * rival purses, all derived from the plan as shown (UI45–UI50).
 */
export function SummaryPanel({
  scrollable = false,
  className,
  focusHeading = false,
  onHeadingFocused,
}: SummaryPanelProps) {
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const view = useSummaryView(teamId);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focusHeading) return;
    headingRef.current?.focus();
    onHeadingFocused?.();
  }, [focusHeading, onHeadingFocused]);

  return (
    <section
      aria-labelledby="summary-heading"
      data-skip-target="summary"
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "flex flex-col rounded-lg border bg-card",
        scrollable &&
          "min-h-0 overflow-y-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <h2
        id="summary-heading"
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "border-b bg-card px-4 py-3 text-base font-semibold outline-none",
          scrollable && "sticky top-0 z-[1]",
        )}
      >
        Summary
      </h2>
      {view.status === "error" ? (
        <div className="p-4">
          <ErrorState
            title="Couldn't load the summary."
            description="Check your connection and try again."
            announce="alert"
            onRetry={view.retry}
          />
        </div>
      ) : view.status === "loading" ? (
        <div aria-hidden="true" className="flex flex-col gap-3 p-4">
          <p role="status" className="sr-only">
            Loading summary…
          </p>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <SummaryContent view={view} />
      )}
    </section>
  );
}

function SummaryContent({ view }: { view: SummaryView }) {
  const { summary, rules, maxSafeBid, rivals, unknownCount } = view;
  return (
    <div className="flex flex-col gap-5 p-4">
      <Status view={view} />

      <div>
        <h3 className="text-sm text-muted-foreground">Max safe bid</h3>
        <p
          className={cn(
            "mt-0.5 flex items-center gap-2 text-2xl font-semibold",
            maxSafeBid.reason.code === "unsafe" &&
              "text-warning-subtle-foreground",
          )}
        >
          {maxSafeBid.reason.code === "unsafe" && (
            <TriangleAlert aria-hidden="true" className="size-5 text-warning" />
          )}
          <MaxSafeBidValue view={maxSafeBid} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {maxSafeBidSentence(maxSafeBid, summary, rules)}
        </p>
      </div>

      <dl className="flex flex-col gap-4">
        <Metric
          label="Planned spend"
          value={
            <>
              <Money lakh={summary.plannedSpendLakh} /> of{" "}
              <Money lakh={summary.purseLakh} />
            </>
          }
          status={summary.remainingLakh < 0 ? "over" : "within"}
          detail={
            summary.remainingLakh < 0 ? (
              <>
                Over by <Money lakh={-summary.remainingLakh} />
              </>
            ) : (
              <>
                <Money lakh={summary.remainingLakh} /> left
              </>
            )
          }
          bar={{ value: summary.plannedSpendLakh, max: summary.purseLakh }}
        />
        <Metric
          label="Squad"
          value={`${String(summary.squadCount)} of ${String(rules.minSquadSize)}–${String(rules.maxSquadSize)}`}
          status={
            summary.squadCount > rules.maxSquadSize
              ? "over"
              : summary.squadCount < rules.minSquadSize
                ? "below"
                : "within"
          }
          detail={
            summary.squadCount > rules.maxSquadSize
              ? `Over by ${String(summary.squadCount - rules.maxSquadSize)}`
              : summary.squadCount < rules.minSquadSize
                ? `${String(rules.minSquadSize - summary.squadCount)} short of the minimum`
                : placesLeft(rules.maxSquadSize - summary.squadCount)
          }
          bar={{
            value: summary.squadCount,
            max: rules.maxSquadSize,
            tick: rules.minSquadSize,
          }}
        />
        <Metric
          label="Overseas"
          value={`${String(summary.overseasCount)} of ${String(rules.maxOverseas)}`}
          status={summary.overseasCount > rules.maxOverseas ? "over" : "within"}
          detail={
            summary.overseasCount > rules.maxOverseas
              ? `Over by ${String(summary.overseasCount - rules.maxOverseas)}`
              : placesLeft(rules.maxOverseas - summary.overseasCount)
          }
          bar={{ value: summary.overseasCount, max: rules.maxOverseas }}
        />
      </dl>

      <section aria-labelledby="summary-roles">
        <h3 id="summary-roles" className="text-sm font-semibold">
          Roles
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {ROLE_ORDER.map((role) => (
            <div
              key={role}
              className="flex items-baseline justify-between gap-2"
            >
              <dt className="text-muted-foreground">
                {ROLE_PLURAL_LABELS[role]}
              </dt>
              <dd className="font-medium tabular-nums">
                {summary.roleBreakdown[role]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {unknownCount > 0 && (
        <p className="flex gap-2 rounded-md bg-info-subtle px-3 py-2 text-sm text-info-subtle-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {unknownCount === 1
            ? "1 target not counted: player not found in the auction data."
            : `${String(unknownCount)} targets not counted: players not found in the auction data.`}
        </p>
      )}

      <section aria-labelledby="summary-rivals" className="border-t pt-4">
        <h3 id="summary-rivals" className="text-sm font-semibold">
          Rival purses
        </h3>
        <p className="text-xs text-muted-foreground">Before the auction</p>
        {rivals.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No other teams.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {rivals.map((rival) => (
              <li
                key={rival.id}
                style={teamColorStyle(rival.colors)}
                className="flex items-center gap-3 text-sm"
              >
                <TeamLogo
                  shortName={rival.shortName}
                  logoPath={rival.logoPath}
                  className="size-8"
                />
                <span className="min-w-0 flex-1">{rival.name}</span>
                <Money
                  lakh={rival.purseRemainingLakh}
                  className="font-medium"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function placesLeft(count: number) {
  return count === 1 ? "1 place left" : `${String(count)} places left`;
}

function Status({ view }: { view: SummaryView }) {
  const { warnings, note, summary, rules } = view;
  if (warnings.length === 0 && !note) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-success-subtle px-3 py-2 text-sm font-medium text-success-subtle-foreground">
        <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
        Within all limits
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {warnings.length > 0 && (
        <section aria-labelledby="summary-warnings">
          <h3 id="summary-warnings" className="sr-only">
            Warnings ({warnings.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {warnings.map((warning) => (
              <StatusItem
                key={warning.code}
                kind="warning"
                text={warningText(warning, summary, rules)}
              />
            ))}
          </ul>
        </section>
      )}
      {note && (
        <ul>
          <StatusItem kind="note" text={noteText(note)} />
        </ul>
      )}
    </div>
  );
}

function StatusItem({
  kind,
  text,
}: {
  kind: "warning" | "note";
  text: StatusText;
}) {
  const Icon = kind === "warning" ? TriangleAlert : Info;
  return (
    <li
      className={cn(
        "flex gap-2 rounded-md px-3 py-2 text-sm",
        kind === "warning"
          ? "bg-warning-subtle text-warning-subtle-foreground"
          : "bg-info-subtle text-info-subtle-foreground",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          kind === "warning" && "text-warning",
        )}
      />
      <div>
        <p className="font-semibold">
          <span className="sr-only">
            {kind === "warning" ? "Warning: " : "Note: "}
          </span>
          {text.title}
        </p>
        <p>{text.detail}</p>
      </div>
    </li>
  );
}

type MetricStatus = "within" | "over" | "below";

const METRIC_STATUS = {
  within: { icon: CircleCheck, label: "Within limit", tone: "success" },
  over: { icon: TriangleAlert, label: "Over the limit", tone: "warning" },
  below: { icon: Info, label: "Below the minimum", tone: "info" },
} as const;

function Metric({
  label,
  value,
  status,
  detail,
  bar,
}: {
  label: string;
  value: ReactNode;
  status: MetricStatus;
  detail: ReactNode;
  bar: { value: number; max: number; tick?: number };
}) {
  const { icon: Icon, label: statusLabel, tone } = METRIC_STATUS[status];
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex flex-col gap-1.5">
        <span className="flex items-center justify-between gap-2">
          <span className="font-medium">{value}</span>
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0",
              tone === "success" && "text-success",
              tone === "warning" && "text-warning",
              tone === "info" && "text-info",
            )}
          />
          <span className="sr-only">{statusLabel}</span>
        </span>
        <LimitBar tone={tone} {...bar} />
        <span
          className={cn(
            "text-xs",
            status === "over"
              ? "font-medium text-warning-subtle-foreground"
              : "text-muted-foreground",
          )}
        >
          {detail}
        </span>
      </dd>
    </div>
  );
}
