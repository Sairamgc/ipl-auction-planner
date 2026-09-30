import { cn } from "@/lib/utils";

/**
 * The plan's headline figures for the tablet strip and mobile bar (§4).
 * Values are placeholders until the summary slice.
 */
export function SummaryFigures({ className }: { className?: string }) {
  const figures = ["Purse left", "Max safe bid", "Warnings"];
  return (
    <dl className={cn("flex flex-wrap gap-x-5 gap-y-1 text-sm", className)}>
      {figures.map((label) => (
        <div key={label} className="flex items-baseline gap-1.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd>
            <span aria-hidden="true">—</span>
            <span className="sr-only">not available yet</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
