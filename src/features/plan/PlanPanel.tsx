import { useSavePlan } from "@/api";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type PlannedTarget,
  removeTarget,
  restoreTarget,
  ROLE_PLURAL_LABELS,
  updatePrice,
} from "@/domain";
import { openPlayerDetail } from "@/features/player-detail";
import { cn } from "@/lib/utils";
import type { PlayerRole, Target } from "@shared/contracts";
import { useParams } from "@tanstack/react-router";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { RetainedRow, TargetRow } from "./PlanRows";
import { SaveStatus } from "./SaveStatus";
import { usePlanView } from "./usePlanView";

/** How long "… removed. Undo" stays, unless the plan changes first (UI40). */
export const UNDO_MS = 10_000;

interface Removed {
  target: Target;
  name: string;
  role: PlayerRole | null;
  /** The plan's target ids right after removing; any other change ends undo. */
  idsAfter: string;
}

function idsOf(targets: Target[]) {
  return targets
    .map((target) => target.auctionEntryId)
    .sort()
    .join(",");
}

interface PlanPanelProps {
  /** Scrolls on its own (tablet and desktop, UI12, UI20). */
  scrollable?: boolean;
  /** Mobile: switches to the Pool tab from the empty hint. */
  onGoToPool?: () => void;
}

/**
 * "My plan" (§3): the squad by role, retained players locked and targets
 * editable in place, with autosave feedback (UI37–UI42).
 */
export function PlanPanel({ scrollable = false, onGoToPool }: PlanPanelProps) {
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const view = usePlanView(teamId);
  const save = useSavePlan(teamId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);

  const targets = view.status === "ready" ? view.targets : null;

  // Undo lasts 10 s, or until the plan changes in any other way (derived)
  useEffect(() => {
    if (!removed) return;
    const timer = setTimeout(() => {
      setRemoved(null);
    }, UNDO_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [removed]);
  const activeRemoved =
    removed && targets && idsOf(targets) === removed.idsAfter ? removed : null;

  // Where focus should go once it exists: saves update the plan a moment
  // later (optimistically, after an async step), so wait for the render
  // that shows the element, then focus it
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    const selector = pendingFocus.current;
    if (!selector) return;
    const element = panelRef.current?.querySelector<HTMLElement>(selector);
    if (element) {
      pendingFocus.current = null;
      element.focus();
    }
  });

  if (view.status !== "ready") {
    return (
      <PanelShell
        scrollable={scrollable}
        panelRef={panelRef}
        headingRef={headingRef}
        teamId={teamId}
      >
        {view.status === "error" ? (
          <div className="p-4">
            <ErrorState
              title="Couldn't load your plan."
              description="Check your connection and try again."
              announce="alert"
              onRetry={view.retry}
            />
          </div>
        ) : (
          <div aria-hidden="true" className="flex flex-col gap-2 p-4">
            <p role="status" className="sr-only">
              Loading plan…
            </p>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        )}
      </PanelShell>
    );
  }

  const { groups, unknown, auctionDate } = view;
  const current = view.targets;
  const targetCount = current.length;

  const editPrice = (entryId: string, lakh: number) => {
    setRemoved(null);
    save(updatePrice(current, entryId, lakh));
  };

  const remove = (target: Target, name: string, role: PlayerRole | null) => {
    const next = removeTarget(current, target.auctionEntryId);
    save(next);
    setRemoved({ target, name, role, idsAfter: idsOf(next) });
    // Focus lands on Undo (UI40)
    pendingFocus.current = "[data-undo] button";
  };

  const undo = () => {
    if (!activeRemoved) return;
    save(restoreTarget(current, activeRemoved.target));
    const entryId = activeRemoved.target.auctionEntryId;
    setRemoved(null);
    pendingFocus.current = `[data-target-id="${entryId}"] [data-detail-trigger]`;
  };

  const openDetail =
    (target: { player: PlannedTarget["player"]; basePriceLakh?: number }) =>
    (trigger: HTMLElement) => {
      openPlayerDetail({ ...target, returnFocusTo: trigger });
    };

  const undoNotice = activeRemoved && (
    <UndoNotice
      name={activeRemoved.name}
      onUndo={undo}
      fallbackFocus={headingRef}
    />
  );
  const noticeHasGroup = groups.some(
    (group) => group.role === activeRemoved?.role,
  );

  return (
    <PanelShell
      scrollable={scrollable}
      panelRef={panelRef}
      headingRef={headingRef}
      teamId={teamId}
    >
      {targetCount === 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm text-muted-foreground">
          <p className="flex-1">
            No targets yet. Use Add on a player in the pool.
          </p>
          {onGoToPool && (
            <Button variant="outline" size="sm" onClick={onGoToPool}>
              Go to Pool
            </Button>
          )}
        </div>
      )}
      {!noticeHasGroup && undoNotice && <ul>{undoNotice}</ul>}
      {unknown.length > 0 && (
        <section aria-labelledby="plan-unknown" className="border-b">
          <h3
            id="plan-unknown"
            className="px-4 pt-3 pb-1 text-sm font-semibold"
          >
            Unknown players · {unknown.length}
          </h3>
          <ul>
            {unknown.map((target) => (
              <li
                key={target.auctionEntryId}
                className="flex items-center gap-3 px-4 py-2 text-sm"
              >
                <span className="flex-1">
                  Not in the auction data ({target.auctionEntryId})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    remove(target, target.auctionEntryId, null);
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {groups.map((group) => {
        const headingId = `plan-group-${group.role}`;
        const count = group.retained.length + group.targets.length;
        return (
          <section key={group.role} aria-labelledby={headingId}>
            <h3
              id={headingId}
              className="border-b bg-muted/40 px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              {ROLE_PLURAL_LABELS[group.role]} · {count}
            </h3>
            <ul>
              {group.retained.map((player) => (
                <RetainedRow
                  key={player.id}
                  player={player}
                  auctionDate={auctionDate}
                  onOpen={openDetail({ player })}
                />
              ))}
              {group.targets.map((target) => (
                <TargetRow
                  key={target.auctionEntryId}
                  target={target}
                  auctionDate={auctionDate}
                  onOpen={openDetail({
                    player: target.player,
                    basePriceLakh: target.basePriceLakh,
                  })}
                  onPriceSave={(lakh) => {
                    editPrice(target.auctionEntryId, lakh);
                  }}
                  onRemove={() => {
                    remove(
                      {
                        auctionEntryId: target.auctionEntryId,
                        expectedPriceLakh: target.expectedPriceLakh,
                      },
                      target.player.name,
                      target.player.role,
                    );
                  }}
                />
              ))}
              {activeRemoved?.role === group.role && undoNotice}
            </ul>
          </section>
        );
      })}
    </PanelShell>
  );
}

function PanelShell({
  scrollable,
  panelRef,
  headingRef,
  teamId,
  children,
}: {
  scrollable: boolean;
  panelRef: RefObject<HTMLElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  teamId: string;
  children: ReactNode;
}) {
  return (
    <section
      ref={panelRef}
      aria-labelledby="plan-heading"
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "flex flex-col rounded-lg border bg-card",
        scrollable &&
          "min-h-0 overflow-y-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b bg-card px-4 py-3",
          scrollable && "sticky top-0 z-[2]",
        )}
      >
        <h2
          id="plan-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-base font-semibold outline-none"
        >
          My plan
        </h2>
        <SaveStatus teamId={teamId} headingRef={headingRef} />
      </div>
      {children}
    </section>
  );
}

/** "… removed. Undo" in place of the removed row (UI40). */
function UndoNotice({
  name,
  onUndo,
  fallbackFocus,
}: {
  name: string;
  onUndo: () => void;
  fallbackFocus: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLLIElement>(null);
  // Don't strand keyboard focus when the notice goes. Checked a frame
  // later, and only if it really left the page and focus fell to <body>:
  // StrictMode runs this cleanup on a mount that is not a real removal
  useLayoutEffect(() => {
    const notice = ref.current;
    const fallback = fallbackFocus.current;
    return () => {
      if (!notice?.contains(document.activeElement)) return;
      requestAnimationFrame(() => {
        const lost =
          document.activeElement === document.body ||
          document.activeElement === null;
        if (!notice.isConnected && lost) fallback?.focus();
      });
    };
  }, [fallbackFocus]);

  return (
    <li
      ref={ref}
      data-undo
      className="flex flex-wrap items-center gap-2 border-b bg-muted/60 px-4 py-2 text-sm"
    >
      <span className="flex-1">{name} removed.</span>
      <Button
        variant="outline"
        size="sm"
        aria-label={`Undo removing ${name}`}
        onClick={onUndo}
      >
        Undo
      </Button>
    </li>
  );
}
