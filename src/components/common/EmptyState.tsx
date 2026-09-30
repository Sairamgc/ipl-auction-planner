import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  /** 1 when this is the page's only content (not-found pages). */
  headingLevel?: 1 | 2;
  className?: string;
}

/** A calm, muted message for "nothing here" (and similar) states. */
export function EmptyState({
  title,
  description,
  children,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg bg-muted p-6",
        className,
      )}
    >
      <Heading className="text-base font-semibold">{title}</Heading>
      {description && <p className="text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
