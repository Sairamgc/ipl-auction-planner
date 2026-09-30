import { PoolPanel } from "@/features/player-pool";

import { PanelPlaceholder } from "./PanelPlaceholder";

/** 1280px and up: pool, plan and summary side by side (§4). */
export function DesktopLayout() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,5fr)_minmax(0,4fr)_20rem] gap-4">
      <PoolPanel layout="wide" scrollable />
      <PanelPlaceholder id="plan" title="My plan" scrollable />
      <PanelPlaceholder id="summary" title="Summary" scrollable />
    </div>
  );
}
