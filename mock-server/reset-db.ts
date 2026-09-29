import { copyFileSync } from "node:fs";

import { DB_PATH, SEED_DB_PATH } from "./paths.ts";

copyFileSync(SEED_DB_PATH, DB_PATH);
console.log("Mock database reset from db.seed.json");
