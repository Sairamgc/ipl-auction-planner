import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry: () => void;
  className?: string;
}

/**
 * Error with a retry. Focus moves to the title when it appears, so keyboard
 * and screen-reader users land on it (instead of an extra live region).
 */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Alert
      role={undefined}
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
