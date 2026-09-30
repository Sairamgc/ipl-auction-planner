import { initialsOf } from "@/lib/initials";
import { cn } from "@/lib/utils";

/**
 * A player's initials in place of a photo (P15). Decorative: the name is
 * always shown next to it.
 */
export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
