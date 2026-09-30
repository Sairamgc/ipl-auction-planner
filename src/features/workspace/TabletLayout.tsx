import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

import { PlanPanel } from "@/features/plan";
import { PoolPanel } from "@/features/player-pool";
import { SummaryFigures, SummaryPanel } from "@/features/summary";

/**
 * 768–1279px: pool and plan side by side; the summary is a strip along
 * the bottom that expands upward (§4).
 */
export function TabletLayout() {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <PoolPanel layout="narrow" scrollable />
        <PlanPanel scrollable />
      </div>

      <Collapsible
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        className="flex max-h-[50%] shrink-0 flex-col rounded-lg border bg-card"
      >
        <CollapsibleContent className="flex min-h-0 flex-col border-b">
          <SummaryPanel scrollable className="flex-1 rounded-b-none border-0" />
        </CollapsibleContent>
        <div className="flex items-center gap-4 px-4 py-2">
          <SummaryFigures className="flex-1" />
          <CollapsibleTrigger asChild>
            {/* Skip-link target while collapsed; the open panel comes first in DOM order (UI55) */}
            <Button variant="ghost" size="sm" data-skip-target="summary">
              {summaryOpen ? "Hide summary" : "Show summary"}
              <ChevronUp
                aria-hidden="true"
                className={summaryOpen ? "rotate-180" : undefined}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </Collapsible>
    </>
  );
}
