import { cn } from "@/lib/utils";
import { useState } from "react";

interface TeamLogoProps {
  shortName: string;
  logoPath?: string | undefined;
  className?: string;
}

/**
 * Franchise logo, or an initials badge in team colours when there is no
 * logo or the image fails to load (P14). Decorative: the team name is
 * always shown next to it, so it is hidden from screen readers. Must sit
 * inside an element styled with `teamColorStyle`.
 */
export function TeamLogo({ shortName, logoPath, className }: TeamLogoProps) {
  // Remembering which path failed means a new path gets a fresh attempt
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const showImage = logoPath !== undefined && failedPath !== logoPath;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
        !showImage &&
          "bg-team text-xs font-semibold text-team-foreground ring-2 ring-team-secondary",
        className,
      )}
    >
      {showImage ? (
        <img
          src={logoPath}
          alt=""
          className="size-full object-contain"
          onError={() => {
            setFailedPath(logoPath);
          }}
        />
      ) : (
        shortName
      )}
    </span>
  );
}
