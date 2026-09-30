import { cn } from "@/lib/utils";

interface PanelPlaceholderProps {
  id: string;
  title: string;
  /**
   * The panel scrolls on its own (tablet and desktop, UI12). It is then
   * focusable, so it can be scrolled with the keyboard in every browser:
   * Safari, unlike Chrome and Firefox, does not make scroll areas
   * focusable by itself (UI20).
   */
  scrollable?: boolean;
  className?: string;
}

/** A workspace panel before its slice is built. */
export function PanelPlaceholder({
  id,
  title,
  scrollable = false,
  className,
}: PanelPlaceholderProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "flex flex-col rounded-lg border bg-card",
        scrollable &&
          "min-h-0 overflow-y-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <h2
        id={headingId}
        className={cn(
          "border-b bg-card px-4 py-3 text-base font-semibold",
          // Stays in view while the panel scrolls
          scrollable && "sticky top-0 z-[1]",
        )}
      >
        {title}
      </h2>
      <div className="p-4">
        <p className="text-muted-foreground">Coming soon</p>
      </div>
    </section>
  );
}
