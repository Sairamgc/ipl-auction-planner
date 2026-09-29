import { z } from "zod";

import { IdSchema } from "./common.ts";

export const RetentionSchema = z.object({
  franchiseId: IdSchema,
  playerId: IdSchema,
});
export type Retention = z.infer<typeof RetentionSchema>;
