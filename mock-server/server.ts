import { copyFileSync, existsSync } from "node:fs";

import { API_BASE, createMockServer } from "./app.ts";
import { DB_PATH, SEED_DB_PATH } from "./paths.ts";
import { describeSimulation, parseSimulationArgs } from "./simulation.ts";

const PORT = 3001;

// e.g. `tsx mock-server/server.ts --delay 300-1200 --fail-rate 0.2`
const simulation = parseSimulationArgs(process.argv.slice(2));

// First run: create the working copy. `npm run db:reset` restores it later.
if (!existsSync(DB_PATH)) copyFileSync(SEED_DB_PATH, DB_PATH);

createMockServer({ db: DB_PATH, simulation }).listen(PORT, () => {
  console.log(
    `Mock server listening on http://localhost:${String(PORT)}${API_BASE}`,
  );
  const description = describeSimulation(simulation);
  if (description) console.log(description);
});
