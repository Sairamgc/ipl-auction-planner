import { z } from "zod";

/** Money in whole lakh: ₹2.40 Cr = 240 (D2). */
export const LakhSchema = z.number().int().nonnegative();

/**
 * Lowercase kebab-case identifier (`csk`, `virat-kohli`, `2026-virat-kohli`).
 * IDs are immutable: assigned once at creation, never recalculated from a
 * changed name.
 */
export const IdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be lowercase kebab-case");

/** Calendar date, `YYYY-MM-DD`. */
export const IsoDateSchema = z.iso.date();

/** Timestamp, ISO 8601 with offset (e.g. `2026-09-29T10:00:00.000Z`). */
export const IsoDateTimeSchema = z.iso.datetime({ offset: true });
