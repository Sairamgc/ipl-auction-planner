import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { PlanPanel } from "@/features/plan";
import { PoolPanel } from "@/features/player-pool";
import { SummaryBarButton, SummaryPanel } from "@/features/summary";

import {
  DEFAULT_TAB,
  WORKSPACE_TABS,
  type WorkspaceTab,
} from "./workspaceSearch";

/** Shared by the fixed bar and its in-flow spacer; clears the iPhone safe area. */
const MINI_BAR =
  "pt-2 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]";

const TAB_LABELS: Record<WorkspaceTab, string> = {
  pool: "Pool",
  plan: "Plan",
  summary: "Summary",
};

function isWorkspaceTab(value: string): value is WorkspaceTab {
  return (WORKSPACE_TABS as readonly string[]).includes(value);
}

/**
 * Below 768px: one panel at a time under sticky tabs, with the active tab
 * in the URL, and a mini summary fixed to the bottom (§4).
 */
export function MobileLayout() {
  const { tab = DEFAULT_TAB } = useSearch({ from: "/teams/$teamId" });
  const navigate = useNavigate({ from: "/teams/$teamId" });
  const goToPool = () => {
    void navigate({
      search: (previous) => ({ ...previous, tab: undefined }),
      replace: true,
    });
  };
  // The bar opens the Summary tab and moves focus to its heading (UI49)
  const [focusSummary, setFocusSummary] = useState(false);
  const openSummary = () => {
    setFocusSummary(true);
    if (tab === "summary") return;
    void navigate({
      search: (previous) => ({ ...previous, tab: "summary" }),
      replace: true,
    });
  };
  const summaryFocused = () => {
    setFocusSummary(false);
  };

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (!isWorkspaceTab(value)) return;
          void navigate({
            search: (previous) => ({
              ...previous,
              tab: value === DEFAULT_TAB ? undefined : value,
            }),
            replace: true,
          });
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          aria-label="Workspace sections"
          // Grows with its 44px touch targets so the sticky bar fully covers
          // what scrolls beneath it
          className="sticky top-[env(safe-area-inset-top)] z-10 w-full border-b bg-background group-data-horizontal/tabs:h-auto"
        >
          {WORKSPACE_TABS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              // Active tab in team colour (V9) at 3:1 (UI11), plus weight
              className="after:h-[3px] after:bg-team-indicator group-data-horizontal/tabs:after:bottom-0 data-active:font-semibold"
            >
              {TAB_LABELS[value]}
            </TabsTrigger>
          ))}
        </TabsList>
        {WORKSPACE_TABS.map((value) => (
          <TabsContent key={value} value={value}>
            {value === "pool" ? (
              <PoolPanel layout="list" />
            ) : value === "plan" ? (
              <PlanPanel onGoToPool={goToPool} />
            ) : (
              <SummaryPanel
                focusHeading={focusSummary}
                onHeadingFocused={summaryFocused}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/*
        Reserves exactly the bar's height at the end of the page, so the
        fixed bar never covers content: same content and padding, so it
        grows with wrapping, text size and the safe area (UI21)
      */}
      <div
        aria-hidden="true"
        inert
        className={cn(MINI_BAR, "invisible border-t border-transparent")}
      >
        <SummaryBarButton />
      </div>
      <aside
        aria-label="Plan summary"
        className={cn(
          MINI_BAR,
          "fixed inset-x-0 bottom-0 z-10 border-t bg-background",
        )}
      >
        <SummaryBarButton onOpen={openSummary} />
      </aside>
    </>
  );
}
