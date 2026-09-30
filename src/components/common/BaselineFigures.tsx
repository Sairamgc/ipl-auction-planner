import { cn } from "@/lib/utils";

import { Money } from "./Money";

interface BaselineFiguresProps {
  purseLakh: number;
  openSlots: number;
  openOverseasSlots: number;
  /** `card`: stacked rows (picker). `inline`: one row (workspace header). */
  variant?: "card" | "inline";
  className?: string;
}

/**
 * A franchise's figures after retentions and before any plan, under one
 * "Before the auction" caption (D15). Shared by the picker cards and the
 * workspace header so the two always match.
 */
export function BaselineFigures({
  purseLakh,
  openSlots,
  openOverseasSlots,
  variant = "card",
  className,
}: BaselineFiguresProps) {
  const figures = [
    { label: "Purse", value: <Money lakh={purseLakh} />, primary: true },
    { label: "Open slots", value: openSlots, primary: false },
    { label: "Overseas slots", value: openOverseasSlots, primary: false },
  ];

  if (variant === "inline") {
    return (
      <div className={className}>
        <p className="text-xs text-muted-foreground">Before the auction</p>
        <dl className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
          {figures.map(({ label, value, primary }) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className={cn(primary && "font-semibold")}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">Before the auction</p>
      <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
        {figures.map(({ label, value, primary }) => [
          <dt
            key={`${label}-term`}
            className={cn("text-muted-foreground", primary && "self-baseline")}
          >
            {label}
          </dt>,
          <dd
            key={`${label}-value`}
            className={cn("text-right", primary && "text-lg font-semibold")}
          >
            {value}
          </dd>,
        ])}
      </dl>
    </div>
  );
}
