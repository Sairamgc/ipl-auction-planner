import { BaselineFigures } from "@/components/common/BaselineFigures";
import { TeamLogo } from "@/components/common/TeamLogo";
import { Skeleton } from "@/components/ui/skeleton";
import type { BaselineFigures as Figures } from "@/domain";
import type { Franchise } from "@shared/contracts";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { TeamSwitcher } from "./TeamSwitcher";
import { WORKSPACE_TITLE_ID } from "./workspaceTitle";

interface WorkspaceHeaderProps {
  franchise: Franchise;
  franchises: Franchise[];
  figures: Figures | null;
}

/**
 * Team, switcher, way back, and the baseline figures (§3, D15). Team
 * colours appear only on the stripe, the line under it and the badge (V9).
 */
export function WorkspaceHeader({
  franchise,
  franchises,
  figures,
}: WorkspaceHeaderProps) {
  return (
    <header className="shrink-0">
      <div aria-hidden="true" className="h-1 rounded-t-lg bg-team" />
      <div aria-hidden="true" className="h-0.5 bg-team-secondary" />

      <div className="flex flex-col gap-3 pt-3">
        <Link
          to="/"
          className="inline-flex touch-target w-fit items-center gap-1 rounded-md text-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          All teams
        </Link>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          {/* The switcher wraps under the name when space runs out */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex min-w-0 items-center gap-3">
              <TeamLogo
                shortName={franchise.shortName}
                logoPath={franchise.logoPath}
              />
              <h1
                id={WORKSPACE_TITLE_ID}
                tabIndex={-1}
                className="min-w-0 text-xl font-semibold outline-none md:text-2xl"
              >
                {franchise.name}
              </h1>
            </div>
            <TeamSwitcher current={franchise} franchises={franchises} />
          </div>

          <div className="md:ml-auto">
            {figures ? (
              <BaselineFigures variant="inline" {...figures} />
            ) : (
              <div aria-hidden="true" className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-72 max-w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
