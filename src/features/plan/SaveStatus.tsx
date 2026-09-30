import { usePlanSaveStatus } from "@/api";
import { Button } from "@/components/ui/button";
import { Check, LoaderCircle } from "lucide-react";
import type { RefObject } from "react";

import { droppedChangeText } from "./droppedChangeText";
import { useDroppedChange } from "./useDroppedChange";

interface SaveStatusProps {
  teamId: string;
  /** Where focus goes after Try again or Dismiss (the error disappears). */
  headingRef: RefObject<HTMLElement | null>;
}

/**
 * Autosave feedback in the plan header (UI41, UI54): "Saving…", "Saved",
 * or an error naming the change a failed save dropped, with Try again
 * (re-applies that change on top of the current plan) and Dismiss. The
 * error stays until dismissed, re-applied, or found in a saved plan.
 */
export function SaveStatus({ teamId, headingRef }: SaveStatusProps) {
  const status = usePlanSaveStatus(teamId);
  const dropped = useDroppedChange(teamId);

  const text =
    status.state === "saving"
      ? "Saving…"
      : dropped || status.state === "error"
        ? "Last change not saved"
        : status.state === "saved"
          ? "Saved"
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
        {status.state === "saved" && !dropped && (
          <Check aria-hidden="true" className="size-3.5" />
        )}
        {text}
      </p>
      {dropped && (
        <div
          role="alert"
          className="col-span-full flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive-subtle px-3 py-2 text-sm text-destructive-subtle-foreground"
        >
          <p className="flex-1 basis-56">
            {droppedChangeText(dropped.change, dropped.names)}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              dropped.retry();
              headingRef.current?.focus();
            }}
          >
            Try again
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              dropped.dismiss();
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
