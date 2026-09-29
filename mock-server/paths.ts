import { join } from "node:path";

export const SEED_DB_PATH = join(import.meta.dirname, "db.seed.json");
export const DB_PATH = join(import.meta.dirname, "db.json");
