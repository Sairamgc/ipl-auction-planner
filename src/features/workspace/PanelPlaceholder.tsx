import { cn } from "@/lib/utils";

interface PanelPlaceholderProps {
  id: string;
  title: string;
  className?: string;
}

/**
 * A workspace panel before its slice is built: a labelled region that
 * scrolls on its own on tablet and desktop (UI12).
 */
export function PanelPlaceholder({
  id,
  title,
  className,
}: PanelPlaceholderProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-h-0 flex-col rounded-lg border bg-card",
        className,
      )}
    >
      <h2 id={headingId} className="border-b px-4 py-3 text-base font-semibold">
        {title}
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </section>
  );
}
