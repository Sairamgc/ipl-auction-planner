import { useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { noteText, type StatusText, warningText } from "./summaryText";
import { useSummaryView } from "./useSummaryView";

/** Waits for changes to settle, so a burst of edits is announced once. */
export const ANNOUNCE_DELAY_MS = 1000;

interface Announced {
  kind: "Warning" | "Note";
  text: StatusText;
}

/**
 * One polite live region for the workspace (UI48): it speaks only when a
 * warning or the note appears or clears, never for figures or amounts.
 * Silent on first load and after a team switch.
 */
export function SummaryAnnouncer() {
  const { teamId } = useParams({ from: "/teams/$teamId" });
  const view = useSummaryView(teamId);
  const [message, setMessage] = useState("");

  const current = new Map<string, Announced>();
  if (view.status === "ready") {
    for (const warning of view.warnings) {
      current.set(warning.code, {
        kind: "Warning",
        text: warningText(warning, view.summary, view.rules),
      });
    }
    if (view.note) {
      current.set(view.note.code, { kind: "Note", text: noteText(view.note) });
    }
  }
  const key = view.status === "ready" ? [...current.keys()].join(",") : null;

  // The newest items, read when the timer fires (amounts may have moved)
  const latest = useRef(current);
  useEffect(() => {
    latest.current = current;
  });
  const announced = useRef<{ teamId: string; items: Map<string, Announced> }>(
    null,
  );

  useEffect(() => {
    if (key === null) return;
    // First ready state for this team: the baseline, not a change
    if (announced.current?.teamId !== teamId) {
      announced.current = { teamId, items: latest.current };
      return;
    }
    const timer = setTimeout(() => {
      const before = announced.current?.items ?? new Map<string, Announced>();
      const after = latest.current;
      const parts: string[] = [];
      for (const [code, item] of after) {
        if (!before.has(code)) parts.push(`${item.kind}: ${item.text.title}.`);
      }
      for (const [code, item] of before) {
        if (!after.has(code)) parts.push(`Cleared: ${item.text.name}.`);
      }
      announced.current = { teamId, items: after };
      if (parts.length > 0) {
        // Alternate a trailing space so a repeat is still a change
        setMessage((previous) => {
          const next = parts.join(" ");
          return previous === next ? `${next}\u00a0` : next;
        });
      }
    }, ANNOUNCE_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [key, teamId]);

  return (
    <p role="status" data-summary-announcer className="sr-only">
      {message}
    </p>
  );
}
