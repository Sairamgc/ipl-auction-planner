import { cn } from "@/lib/utils";

export interface SkipTarget {
  /** Matches a `data-skip-target` attribute on the element to focus. */
  id: string;
  label: string;
}

/**
 * Links to jump between the side-by-side panels (UI55): without them a
 * keyboard user tabs through every loaded pool row to reach the plan.
 * Hidden until focused. Focus goes to the panel itself, a scrollable
 * focusable region (UI20), or the summary strip's toggle on tablet.
 */
export function SkipLinks({ targets }: { targets: SkipTarget[] }) {
  return (
    <nav aria-label="Skip to a panel" className="contents">
      <ul className="contents">
        {targets.map(({ id, label }) => (
          <li key={id} className="contents">
            <a
              href={`#${id}`}
              onClick={(event) => {
                event.preventDefault();
                document
                  .querySelector<HTMLElement>(`[data-skip-target="${id}"]`)
                  ?.focus();
              }}
              className={cn(
                "sr-only rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
                "focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[max(0.5rem,env(safe-area-inset-top))] focus-visible:left-4 focus-visible:z-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
