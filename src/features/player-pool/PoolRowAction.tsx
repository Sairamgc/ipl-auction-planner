import { Money } from "@/components/common/Money";
import { Button } from "@/components/ui/button";
import { openAddTarget } from "@/features/add-target";
import type { PoolRow, Target } from "@shared/contracts";
import { Check } from "lucide-react";

interface PoolRowActionProps {
  row: PoolRow;
  /** The row's target when the player is already in the plan. */
  target: Target | undefined;
}

/**
 * The row's action beside the name button (UI30): Add, or a plain
 * "In plan" tag with the expected price once added (UI38).
 */
export function PoolRowAction({ row, target }: PoolRowActionProps) {
  if (target) {
    return (
      // Two short lines, so the tag doesn't squeeze the names (UI38)
      <span className="inline-flex flex-col items-end rounded-md border px-2 py-0.5 text-xs leading-tight">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <Check aria-hidden="true" className="size-3.5" />
          In plan
        </span>
        <span className="sr-only"> at </span>
        <Money lakh={target.expectedPriceLakh} />
      </span>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={`Add ${row.player.name} to plan`}
      onClick={(event) => {
        openAddTarget({ row, opener: event.currentTarget });
      }}
    >
      Add
    </Button>
  );
}
