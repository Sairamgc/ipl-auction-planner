import type { RequestHandler } from "express";

import {
  SavePlanRequestSchema,
  toStrict,
} from "../../shared/contracts/index.ts";
import type { Database } from "../dbSchema.ts";

import { sendError } from "./errors.ts";

const StrictSavePlanRequest = toStrict(SavePlanRequestSchema);

/**
 * PUT /plans/:franchiseId (N12). Validates the whole plan against the
 * contract, requires an existing franchise, and sets `updatedAt`.
 */
export function createSavePlanHandler(
  getDb: () => Database,
  persist: () => void,
  now: () => Date = () => new Date(),
): RequestHandler<{ franchiseId: string }> {
  return (req, res) => {
    const { franchiseId } = req.params;
    const db = getDb();

    if (!db.franchises.some((franchise) => franchise.id === franchiseId)) {
      sendError(res, 404, `Unknown franchise "${franchiseId}"`);
      return;
    }
    const body = StrictSavePlanRequest.safeParse(req.body);
    if (!body.success) {
      sendError(res, 400, "Invalid plan", body.error);
      return;
    }
    if (body.data.id !== franchiseId) {
      sendError(res, 400, "Plan id must match the URL");
      return;
    }
    const plan = db.plans.find((p) => p.id === franchiseId);
    if (!plan) {
      sendError(res, 404, `No plan for franchise "${franchiseId}"`);
      return;
    }

    Object.assign(plan, body.data, { updatedAt: now().toISOString() });
    persist();
    res.json(plan);
  };
}
