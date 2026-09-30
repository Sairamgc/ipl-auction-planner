import { Money } from "@/components/common/Money";
import { TeamLogo } from "@/components/common/TeamLogo";
import { teamColorStyle } from "@/components/common/teamColorStyle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

import { planStatusLabel } from "./planStatusLabel";
import type { TeamPickerCard } from "./useTeamPicker";

/**
 * One franchise. The team name is the only link; it stretches over the
 * whole card, so the card is one click and one tab stop, and the link's
 * accessible name stays just the team name (UI5).
 */
export function TeamCard({ franchise, preview }: TeamPickerCard) {
  const { planStatus } = preview;
  return (
    <Card
      style={teamColorStyle(franchise.colors)}
      className="relative h-full gap-4 rounded-lg pt-0 transition-shadow hover:ring-foreground/25 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring"
    >
      {/* Team accent (V9): decorative stripe, never carries information */}
      <div aria-hidden="true" className="h-1 bg-team" />

      <div className="flex items-center gap-3 px-4">
        <TeamLogo
          shortName={franchise.shortName}
          logoPath={franchise.logoPath}
        />
        <h2 className="text-base leading-snug font-semibold">
          <Link
            to="/teams/$teamId"
            params={{ teamId: franchise.id }}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {franchise.name}
          </Link>
        </h2>
      </div>

      <div className="px-4">
        <p className="text-xs text-muted-foreground">Before the auction</p>
        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
          <dt className="self-baseline text-muted-foreground">Purse</dt>
          <dd className="text-right text-lg font-semibold">
            <Money lakh={preview.purseLakh} />
          </dd>
          <dt className="text-muted-foreground">Open slots</dt>
          <dd className="text-right">{preview.openSlots}</dd>
          <dt className="text-muted-foreground">Overseas slots</dt>
          <dd className="text-right">{preview.openOverseasSlots}</dd>
        </dl>
      </div>

      <div className="mt-auto px-4">
        <Badge
          variant={planStatus.kind === "not-started" ? "secondary" : "outline"}
        >
          {planStatusLabel(planStatus)}
        </Badge>
      </div>
    </Card>
  );
}
