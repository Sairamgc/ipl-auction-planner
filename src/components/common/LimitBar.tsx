import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const fill = cva("h-full rounded-full", {
  variants: {
    tone: {
      success: "bg-success",
      warning: "bg-warning",
      info: "bg-info",
    },
  },
});

interface LimitBarProps extends Required<VariantProps<typeof fill>> {
  value: number;
  /** The bar's full width. */
  max: number;
  /** Optional mark, e.g. a minimum. */
  tick?: number;
  className?: string;
}

/**
 * A thin bar showing a value against a limit. Decorative: the figures
 * beside it carry the meaning, so it is hidden from screen readers.
 */
export function LimitBar({ value, max, tick, tone, className }: LimitBarProps) {
  const percent = (part: number) =>
    max > 0 ? Math.min(100, Math.max(0, (part / max) * 100)) : 100;
  return (
    <div
      aria-hidden="true"
      className={cn("relative h-1.5 rounded-full bg-muted", className)}
    >
      <div
        className={fill({ tone })}
        style={{ width: `${String(percent(value))}%` }}
      />
      {tick !== undefined && (
        <div
          className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-foreground/60"
          style={{ left: `${String(percent(tick))}%` }}
        />
      )}
    </div>
  );
}
