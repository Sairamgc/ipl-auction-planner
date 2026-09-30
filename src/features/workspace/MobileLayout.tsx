import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { PanelPlaceholder } from "./PanelPlaceholder";
import { SummaryFigures } from "./SummaryFigures";
import {
  DEFAULT_TAB,
  WORKSPACE_TABS,
  type WorkspaceTab,
} from "./workspaceSearch";

const TAB_LABELS: Record<WorkspaceTab, string> = {
  pool: "Pool",
  plan: "Plan",
  summary: "Summary",
};

const PANEL_TITLES: Record<WorkspaceTab, string> = {
  pool: "Player pool",
  plan: "My plan",
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
        className="gap-4 pb-20"
      >
        <TabsList
          variant="line"
          aria-label="Workspace sections"
          className="sticky top-0 z-10 w-full border-b bg-background"
        >
          {WORKSPACE_TABS.map((value) => (
            <TabsTrigger
              key={value}
              value={value}
              // Active tab in team colour (V9) at 3:1 (UI11), plus weight
              className="after:h-[3px] after:bg-team-indicator data-active:font-semibold"
            >
              {TAB_LABELS[value]}
            </TabsTrigger>
          ))}
        </TabsList>
        {WORKSPACE_TABS.map((value) => (
          <TabsContent key={value} value={value}>
            <PanelPlaceholder id={value} title={PANEL_TITLES[value]} />
          </TabsContent>
        ))}
      </Tabs>

      <aside
        aria-label="Plan summary"
        className="fixed inset-x-0 bottom-0 z-10 border-t bg-background px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <SummaryFigures />
      </aside>
    </>
  );
}
