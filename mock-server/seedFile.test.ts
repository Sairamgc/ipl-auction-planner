import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SEED_DB_PATH } from "./paths.ts";
import { validateSeed } from "./seedValidation.ts";

describe("db.seed.json", () => {
  it("passes seed validation (N3)", () => {
    const seed: unknown = JSON.parse(readFileSync(SEED_DB_PATH, "utf8"));
    expect(validateSeed(seed)).toEqual([]);
  });
});
