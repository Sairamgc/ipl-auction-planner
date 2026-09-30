import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

import { PanelPlaceholder } from "./PanelPlaceholder";
import { SummaryFigures } from "./SummaryFigures";

/**
 * 768–1279px: pool and plan side by side; the summary is a strip along
 * the bottom that expands upward (§4).
 */
export function TabletLayout() {
  const [summaryOpen, setSummaryOpen] = useState(false);

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <PanelPlaceholder id="pool" title="Player pool" />
        <PanelPlaceholder id="plan" title="My plan" />
      </div>

      <Collapsible
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        className="flex max-h-[50%] shrink-0 flex-col rounded-lg border bg-card"
      >
        <CollapsibleContent className="min-h-0 overflow-y-auto border-b">
          <PanelPlaceholder id="summary" title="Summary" className="border-0" />
        </CollapsibleContent>
        <div className="flex items-center gap-4 px-4 py-2">
          <SummaryFigures className="flex-1" />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
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
