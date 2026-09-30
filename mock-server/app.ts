import { join } from "node:path";

import type { Application } from "express";
import jsonServer from "json-server";

import type { Database } from "./dbSchema.ts";
import { allowOnlyPlanSaves, hideAuctionResults } from "./routes/guards.ts";
import { createSavePlanHandler } from "./routes/plans.ts";
import { createPoolHandler } from "./routes/pool.ts";
import {
  NO_SIMULATION,
  type SimulationOptions,
  simulationMiddleware,
} from "./simulation.ts";

/** Same base path the app uses; the Vite dev proxy forwards /api unchanged. */
export const API_BASE = "/api";

// json-server always mounts express.static; point it at a folder that does
// not exist so nothing is served (the app's public/ is served by Vite)
const NO_STATIC_DIR = join(import.meta.dirname, "__no-static__");

export interface MockServerOptions {
  /** Path to db.json, or an in-memory database (tests). */
  db: string | Database;
  simulation?: SimulationOptions;
  logger?: boolean;
}

export function createMockServer({
  db,
  simulation = NO_SIMULATION,
  logger = true,
}: MockServerOptions): Application {
  const server = jsonServer.create();
  const router = jsonServer.router<Database>(db);
  const getDb = () => router.db.getState();
  const persist = () => {
    void router.db.write();
  };

  server.use(API_BASE, simulationMiddleware(simulation));
  server.use(
    API_BASE,
    // No CORS: the app reaches this server through the Vite proxy
    jsonServer.defaults({ noCors: true, static: NO_STATIC_DIR, logger }),
  );
  server.use(API_BASE, hideAuctionResults, allowOnlyPlanSaves);

  // Custom routes go before the default json-server router
  server.get(`${API_BASE}/pool`, createPoolHandler(getDb));
  server.put(
    `${API_BASE}/plans/:franchiseId`,
    jsonServer.bodyParser,
    createSavePlanHandler(getDb, persist),
  );

  server.use(API_BASE, router);
  return server;
}
