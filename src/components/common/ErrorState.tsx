import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry: () => void;
  /**
   * `focus` (page-level errors): focus moves to the title. `alert`
   * (errors inside a panel): announced as an alert, focus stays where the
   * user is, e.g. typing in the search box (UI32).
   */
  announce?: "focus" | "alert";
  className?: string;
}

/** Error with a retry, announced by moving focus or as an alert. */
export function ErrorState({
  title,
  description,
  onRetry,
  announce = "focus",
  className,
}: ErrorStateProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (announce === "focus") titleRef.current?.focus();
  }, [announce]);

  return (
    <Alert
      role={announce === "alert" ? "alert" : undefined}
      className={cn(
        "gap-2 border-destructive/30 bg-destructive-subtle p-4 text-destructive-subtle-foreground",
        className,
      )}
    >
      <AlertTitle>
        <h2 ref={titleRef} tabIndex={-1} className="text-base outline-none">
          {title}
        </h2>
      </AlertTitle>
      {description && (
        <AlertDescription className="text-destructive-subtle-foreground">
          {description}
        </AlertDescription>
      )}
      <div>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Alert>
  );
}
