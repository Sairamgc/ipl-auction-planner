import { usePlanSaveStatus } from "@/api";
import { Button } from "@/components/ui/button";
import { Check, LoaderCircle } from "lucide-react";
import { type RefObject, useState } from "react";

interface SaveStatusProps {
  teamId: string;
  /** Where focus goes after Try again or Dismiss (the error disappears). */
  headingRef: RefObject<HTMLElement | null>;
}

/**
 * Autosave feedback in the plan header (UI41): "Saving…", "Saved", or an
 * error with Try again and Dismiss. The error stays until dismissed,
 * retried, or a later save succeeds. After a failed save the plan has
 * already rolled back (N30).
 */
export function SaveStatus({ teamId, headingRef }: SaveStatusProps) {
  const status = usePlanSaveStatus(teamId);
  const [dismissed, setDismissed] = useState<number | null>(null);
  const showError = status.state === "error" && status.failedAt !== dismissed;

  const text =
    status.state === "saving"
      ? "Saving…"
      : status.state === "saved"
        ? "Saved"
        : status.state === "error"
          ? "Last change not saved"
          : "";

  return (
    <>
      <p
        role="status"
        className="flex min-h-5 items-center gap-1 text-xs text-muted-foreground"
      >
        {status.state === "saving" && (
          <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
        )}
        {status.state === "saved" && (
          <Check aria-hidden="true" className="size-3.5" />
        )}
        {text}
      </p>
      {showError && (
        <div
          role="alert"
          className="col-span-full flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive-subtle px-3 py-2 text-sm text-destructive-subtle-foreground"
        >
          <p className="flex-1 basis-56">
            Couldn&apos;t save your last change. Your plan is back to its last
            saved version.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              status.retry();
              headingRef.current?.focus();
            }}
          >
            Try again
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDismissed(status.failedAt);
              headingRef.current?.focus();
            }}
          >
            Dismiss
          </Button>
        </div>
      )}
    </>
  );
}
