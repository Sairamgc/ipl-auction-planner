import { useAuction } from "@/api";
import { InitialsAvatar } from "@/components/common/InitialsAvatar";
import { Money } from "@/components/common/Money";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ageOn,
  BATTING_HAND_LABELS,
  BOWLING_STYLE_LABELS,
  formatDate,
  isOverseas,
  NATIONALITY_LABELS,
  ROLE_LABELS,
} from "@/domain";
import { useEffect } from "react";

import { usePlayerDetailStore } from "./playerDetailStore";

/**
 * Read-only player details (§3 flow 1). Rendered once per workspace; opened
 * with `openPlayerDetail`. Focus returns to whatever opened it (UI29).
 */
export function PlayerDetailDialog() {
  const { detail, isOpen, close } = usePlayerDetailStore();
  const auction = useAuction();

  // Leaving the workspace closes the dialog
  useEffect(() => close, [close]);

  const player = detail?.player;
  const auctionDate = auction.data?.auctionDate;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      {player && (
        <DialogContent
          className="max-w-md"
          onCloseAutoFocus={(event) => {
            const target = detail.returnFocusTo;
            // Explicit, because Safari does not focus buttons on click
            if (target?.isConnected) {
              event.preventDefault();
              target.focus();
            }
          }}
        >
          <DialogHeader className="flex-row items-center gap-3 text-left">
            <InitialsAvatar name={player.name} />
            <div className="flex flex-col gap-0.5">
              <DialogTitle>{player.name}</DialogTitle>
              <DialogDescription>{ROLE_LABELS[player.role]}</DialogDescription>
            </div>
          </DialogHeader>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">Age</dt>
            <dd>
              {auctionDate ? (
                <>
                  {ageOn(player.dateOfBirth, auctionDate)}{" "}
                  <span className="text-muted-foreground">
                    (on {formatDate(auctionDate)})
                  </span>
                </>
              ) : (
                "—"
              )}
            </dd>
            <dt className="text-muted-foreground">Nationality</dt>
            <dd className="flex flex-wrap items-center gap-2">
              {NATIONALITY_LABELS[player.nationality]}
              {isOverseas(player.nationality) && (
                <Badge variant="outline">Overseas</Badge>
              )}
            </dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>{ROLE_LABELS[player.role]}</dd>
            <dt className="text-muted-foreground">Batting</dt>
            <dd>{BATTING_HAND_LABELS[player.battingHand]}-handed</dd>
            <dt className="text-muted-foreground">Bowling</dt>
            <dd>{BOWLING_STYLE_LABELS[player.bowlingStyle]}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{player.isCapped ? "Capped" : "Uncapped"}</dd>
            {detail.basePriceLakh !== undefined && (
              <>
                <dt className="text-muted-foreground">Base price</dt>
                <dd className="font-semibold">
                  <Money lakh={detail.basePriceLakh} />
                </dd>
              </>
            )}
          </dl>
        </DialogContent>
      )}
    </Dialog>
  );
}
