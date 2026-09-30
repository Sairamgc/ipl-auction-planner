import { TeamLogo } from "@/components/common/TeamLogo";
import { teamColorStyle } from "@/components/common/teamColorStyle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Franchise } from "@shared/contracts";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

import { focusWorkspaceTitle } from "./workspaceTitle";

interface TeamSwitcherProps {
  current: Franchise;
  /** Alphabetical. */
  franchises: Franchise[];
}

/**
 * Switches workspace directly (§3 flow 5). Keeps every search param, so
 * pool filters and the mobile tab carry over (UI14). Focus then moves to
 * the workspace title, not back to this trigger (UI15).
 */
export function TeamSwitcher({ current, franchises }: TeamSwitcherProps) {
  const navigate = useNavigate();
  // The navigation started by the last selection, until the menu closes
  const pendingSwitch = useRef<Promise<void> | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Switch team, current: ${current.name}`}
        >
          Switch team
          <ChevronDown aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-64"
        onCloseAutoFocus={(event) => {
          const navigation = pendingSwitch.current;
          if (!navigation) return;
          pendingSwitch.current = null;
          // The menu traps focus until it has fully closed, so hand focus to
          // the new title only now, once the new team has also rendered
          event.preventDefault();
          void navigation.then(focusWorkspaceTitle);
        }}
      >
        <DropdownMenuLabel>Teams</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current.id}
          onValueChange={(teamId) => {
            if (teamId === current.id) return;
            pendingSwitch.current = navigate({
              to: "/teams/$teamId",
              params: { teamId },
              search: (previous) => previous,
            });
          }}
        >
          {franchises.map((franchise) => (
            <DropdownMenuRadioItem
              key={franchise.id}
              value={franchise.id}
              style={teamColorStyle(franchise.colors)}
              className="gap-2"
            >
              <TeamLogo
                shortName={franchise.shortName}
                logoPath={franchise.logoPath}
                className="size-6 rounded-md text-[0.625rem] ring-1"
              />
              {franchise.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
