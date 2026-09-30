import type { RequestHandler } from "express";

import { sendError } from "./errors.ts";

/** The only write the API offers (requirements §8). */
const WRITABLE = /^\/plans\/[^/]+\/?$/;

/**
 * Keeps the mock to the agreed API: 405 for every write except
 * PUT /plans/:franchiseId, so the app cannot come to rely on json-server's
 * extra endpoints. Paths are relative to the API base.
 */
export const allowOnlyPlanSaves: RequestHandler = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    next();
    return;
  }
  const planPath = WRITABLE.test(req.path);
  if (req.method === "PUT" && planPath) {
    next();
    return;
  }
  res.setHeader("Allow", planPath ? "GET, PUT" : "GET");
  sendError(res, 405, `${req.method} is not allowed on ${req.path}`);
};

/** Auction results are stored for later but not served in v1 (A1). */
export const hideAuctionResults: RequestHandler = (req, res, next) => {
  if (/^\/auctionResults(\/|$)/.test(req.path)) {
    sendError(res, 404, "Not found");
    return;
  }
  next();
};
