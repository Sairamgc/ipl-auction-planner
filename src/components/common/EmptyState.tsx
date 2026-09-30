import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/** A calm, muted message for "nothing here" (and similar) states. */
export function EmptyState({
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg bg-muted p-6",
        className,
      )}
    >
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
