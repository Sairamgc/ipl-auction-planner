import type { RequestHandler } from "express";

/**
 * GET /pool: filtered, joined, sorted and paginated auction pool.
 * Contract: docs/requirements.md §8. Implemented with the player-pool feature.
 */
export const getPool: RequestHandler = (_req, res) => {
  res.status(501).json({ error: "GET /pool is not implemented yet" });
};
