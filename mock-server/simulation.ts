import { parseArgs } from "node:util";

import type { RequestHandler } from "express";
import { z } from "zod";

/** Dev-only latency and failure simulation (N2, N25). Off by default. */
export interface SimulationOptions {
  /** Delay range in ms, inclusive; null for no delay. */
  delay: { minMs: number; maxMs: number } | null;
  /** Probability (0–1) that a request fails with a 500. */
  failRate: number;
}

export const NO_SIMULATION: SimulationOptions = { delay: null, failRate: 0 };

const DelaySchema = z
  .string()
  .regex(/^\d+(-\d+)?$/, "Use milliseconds (800) or a range (300-1200)")
  .transform((raw) => {
    const [min, max = min] = raw.split("-").map(Number) as [number, number?];
    return { minMs: min, maxMs: max };
  })
  .refine((range) => range.minMs <= range.maxMs, "Range must be low-high");

const FailRateSchema = z.coerce.number().min(0).max(1);

/**
 * Reads `--delay <ms|min-max>` and `--fail-rate <0-1>` from command-line
 * arguments (portable across shells, unlike env vars). Throws on bad input.
 */
export function parseSimulationArgs(args: string[]): SimulationOptions {
  const { values } = parseArgs({
    args,
    options: {
      delay: { type: "string" },
      "fail-rate": { type: "string" },
    },
    strict: true,
  });
  return {
    delay: values.delay === undefined ? null : DelaySchema.parse(values.delay),
    failRate:
      values["fail-rate"] === undefined
        ? 0
        : FailRateSchema.parse(values["fail-rate"]),
  };
}

export function describeSimulation({ delay, failRate }: SimulationOptions) {
  const parts = [
    delay &&
      (delay.minMs === delay.maxMs
        ? `delay ${String(delay.minMs)} ms`
        : `delay ${String(delay.minMs)}–${String(delay.maxMs)} ms`),
    failRate > 0 && `fail rate ${String(failRate)}`,
  ].filter(Boolean);
  return parts.length > 0 ? `Simulating: ${parts.join(", ")}` : null;
}

interface SimulationDeps {
  /** Returns a number in [0, 1). */
  random: () => number;
  sleep: (ms: number) => Promise<void>;
}

const defaultDeps: SimulationDeps = {
  random: Math.random,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export function simulationMiddleware(
  { delay, failRate }: SimulationOptions,
  { random, sleep }: SimulationDeps = defaultDeps,
): RequestHandler {
  return (_req, res, next) => {
    const delayMs = delay
      ? delay.minMs + Math.floor(random() * (delay.maxMs - delay.minMs + 1))
      : 0;
    void sleep(delayMs).then(() => {
      if (failRate > 0 && random() < failRate) {
        res.status(500).json({ error: "Simulated failure" });
      } else {
        next();
      }
    });
  };
}
