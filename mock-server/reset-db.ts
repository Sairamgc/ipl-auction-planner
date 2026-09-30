import { copyFileSync } from "node:fs";

import { DB_PATH, SEED_DB_PATH } from "./paths.ts";
import { validateSeedFile } from "./seedFile.ts";

// Never restore from a seed that breaks the contracts (N3)
if (!validateSeedFile()) process.exit(1);

copyFileSync(SEED_DB_PATH, DB_PATH);
console.log("Mock database reset from db.seed.json");
console.warn(
  "Note: provisional starter seed (CSK and RCB only). See docs/data-sources.md.",
);
