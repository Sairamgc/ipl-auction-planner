import { z } from "zod";

import { IdSchema, LakhSchema } from "./common.ts";

/** A player's listing in the auction pool (D1). */
export const AuctionEntrySchema = z.object({
  id: IdSchema,
  playerId: IdSchema,
  basePriceLakh: LakhSchema.positive(),
});
export type AuctionEntry = z.infer<typeof AuctionEntrySchema>;
