import {
  formatLakh,
  formatLakhLabel,
  type MaxSafeBidView,
  type PlanNote,
  type PlanSummary,
  type PlanWarning,
} from "@/domain";
import type { SquadRules } from "@shared/contracts";

/**
 * The summary's words (UI45–UI50). Pure, so every variant is tested once
 * and the panel, strip, bar and announcer all say the same thing.
 */

export interface StatusText {
  title: string;
  detail: string;
  /** Short name for "Cleared: …" announcements. */
  name: string;
}

function players(count: number) {
  return count === 1 ? "1 player" : `${String(count)} players`;
}

export function warningText(
  warning: PlanWarning,
  summary: PlanSummary,
  rules: SquadRules,
): StatusText {
  switch (warning.code) {
    case "over-purse":
      return {
        title: `Over purse by ${formatLakh(warning.overByLakh)}`,
        detail: `Planned spend ${formatLakh(summary.plannedSpendLakh)} is more than the ${formatLakh(summary.purseLakh)} purse.`,
        name: "over purse",
      };
    case "over-max-squad":
      return {
        title: "Squad over the maximum",
        detail: `${players(warning.squadCount)}; the maximum is ${String(warning.maxSquadSize)}.`,
        name: "squad over the maximum",
      };
    case "over-overseas-cap":
      return {
        title: "Too many overseas players",
        detail: `${String(warning.overseasCount)} overseas; the cap is ${String(warning.maxOverseas)}.`,
        name: "too many overseas players",
      };
    case "min-squad-unaffordable": {
      const short = rules.minSquadSize - summary.squadCount;
      return {
        title: "Can't afford the minimum squad",
        detail: `${formatLakh(warning.shortfallLakh)} short of ${String(short)} more ${short === 1 ? "player" : "players"} at ${formatLakh(rules.lowestBasePriceLakh)} each.`,
        name: "can't afford the minimum squad",
      };
    }
  }
}

export function noteText(note: PlanNote): StatusText {
  return {
    title: `${players(note.playersShort)} short of the minimum`,
    detail: `Squad ${String(note.squadCount)}; the minimum is ${String(note.minSquadSize)}.`,
    name: "below the minimum squad",
  };
}

export function maxSafeBidSentence(
  view: MaxSafeBidView,
  summary: PlanSummary,
  rules: SquadRules,
): string {
  const { reason } = view;
  switch (reason.code) {
    case "unsafe":
      return "Not enough purse left. See warnings.";
    case "slots":
      return `The most you can bid for your next player and still buy ${String(reason.slotsToFill)} more ${reason.slotsToFill === 1 ? "player" : "players"} at ${formatLakh(rules.lowestBasePriceLakh)} to reach ${String(rules.minSquadSize)}.`;
    case "completes":
      return "Your next player completes the minimum squad.";
    case "reached":
      return "Your squad already reaches the minimum.";
    case "full":
      return `Your squad is full (${String(summary.squadCount)} of ${String(rules.maxSquadSize)}).`;
  }
}

export function warningCountText(count: number) {
  if (count === 0) return "no warnings";
  return count === 1 ? "1 warning" : `${String(count)} warnings`;
}

/** The mobile bar's accessible name: always the live figures (UI49). */
export function summaryBarLabel(
  figures: {
    remainingLakh: number;
    maxSafeBid: MaxSafeBidView;
    warningCount: number;
  } | null,
): string {
  if (!figures) return "Plan summary unavailable. Open summary";
  const { remainingLakh, maxSafeBid, warningCount } = figures;
  const bid = `max safe bid ${formatLakhLabel(maxSafeBid.displayedLakh)}${
    maxSafeBid.reason.code === "unsafe" ? ", not enough purse left" : ""
  }`;
  return `Purse left ${formatLakhLabel(remainingLakh)}, ${bid}, ${warningCountText(warningCount)}. Open summary`;
}
