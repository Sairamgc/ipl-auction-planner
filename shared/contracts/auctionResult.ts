import { z } from "zod";

import { IdSchema, LakhSchema } from "./common.ts";

/** Real auction outcome. Stored for a future feature; v1 never fetches it (A1). */
export const AuctionResultSchema = z.discriminatedUnion("status", [
  z.object({
    auctionEntryId: IdSchema,
    status: z.literal("sold"),
    franchiseId: IdSchema,
    priceLakh: LakhSchema.positive(),
  }),
  z.object({
    auctionEntryId: IdSchema,
    status: z.literal("unsold"),
  }),
]);
export type AuctionResult = z.infer<typeof AuctionResultSchema>;
