import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import jsonServer from "json-server";

import { DB_PATH, SEED_DB_PATH } from "./paths.ts";
import { getPool } from "./routes/pool.ts";

const PORT = 3001;
// Same base path the app uses; the Vite dev proxy forwards /api here unchanged
const API_BASE = "/api";
// json-server always mounts express.static; point it at a folder that does
// not exist so nothing is served (the app's public/ is served by Vite)
const NO_STATIC_DIR = join(import.meta.dirname, "__no-static__");

// First run: create the working copy. `npm run db:reset` restores it later.
if (!existsSync(DB_PATH)) copyFileSync(SEED_DB_PATH, DB_PATH);

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);

server.use(
  API_BASE,
  // No CORS: the app reaches this server through the Vite proxy
  jsonServer.defaults({ noCors: true, static: NO_STATIC_DIR }),
);

// Custom routes go before the default json-server router
server.get(`${API_BASE}/pool`, getPool);

server.use(API_BASE, router);

server.listen(PORT, () => {
  console.log(
    `Mock server listening on http://localhost:${String(PORT)}${API_BASE}`,
  );
});
