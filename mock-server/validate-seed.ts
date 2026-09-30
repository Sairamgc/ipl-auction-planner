import { validateSeedFile } from "./seedFile.ts";

if (!validateSeedFile()) process.exit(1);
