import { Button } from "@/components/ui/button";
import { ageOn, formatLakh, type PlannedTarget, ROLE_LABELS } from "@/domain";
import type { Player } from "@shared/contracts";
import { Lock, Trash2 } from "lucide-react";

import { DetailTrigger } from "./DetailTrigger";
import { PriceInput } from "./PriceInput";

function meta(player: Player, auctionDate: string) {
  return [
    ROLE_LABELS[player.role],
    player.nationality,
    String(ageOn(player.dateOfBirth, auctionDate)),
  ].join(" · ");
}

/** A retained player: locked, no price or controls (§3). */
export function RetainedRow({
  player,
  auctionDate,
  onOpen,
}: {
  player: Player;
  auctionDate: string;
  onOpen: (trigger: HTMLElement) => void;
}) {
  return (
    <li className="relative flex items-center gap-3 border-b px-4 py-2 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <DetailTrigger name={player.name} onOpen={onOpen} />
        <span className="text-xs text-muted-foreground">
          {meta(player, auctionDate)}
        </span>
      </div>
      {/* Text and icon, never colour alone */}
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Lock aria-hidden="true" className="size-3.5" />
        Retained
      </span>
    </li>
  );
}

/** A target: expected price editable in place, removable (flows 3, 4). */
export function TargetRow({
  target,
  auctionDate,
  onOpen,
  onPriceSave,
  onRemove,
}: {
  target: PlannedTarget;
  auctionDate: string;
  onOpen: (trigger: HTMLElement) => void;
  onPriceSave: (lakh: number) => void;
  onRemove: () => void;
}) {
  const { player } = target;
  return (
    <li
      data-target-id={target.auctionEntryId}
      className="relative flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2 last:border-b-0"
    >
      <div className="flex min-w-40 flex-1 flex-col">
        <DetailTrigger name={player.name} onOpen={onOpen} />
        <span className="text-xs text-muted-foreground">
          {meta(player, auctionDate)} · base {formatLakh(target.basePriceLakh)}
        </span>
      </div>
      {/* Above the name button's stretched area */}
      <div className="relative z-[1] flex items-start gap-1">
        <PriceInput
          playerName={player.name}
          savedLakh={target.expectedPriceLakh}
          basePriceLakh={target.basePriceLakh}
          onSave={onPriceSave}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${player.name} from plan`}
          onClick={onRemove}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
