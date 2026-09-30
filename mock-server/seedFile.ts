import { readFileSync } from "node:fs";

import { SEED_DB_PATH } from "./paths.ts";
import { validateSeed } from "./seedValidation.ts";

/** Validates db.seed.json and prints the result; true when valid (N3). */
export function validateSeedFile(): boolean {
  const problems = validateSeed(JSON.parse(readFileSync(SEED_DB_PATH, "utf8")));
  if (problems.length === 0) {
    console.log("db.seed.json is valid");
    return true;
  }
  console.error(`db.seed.json has ${String(problems.length)} problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  return false;
}
