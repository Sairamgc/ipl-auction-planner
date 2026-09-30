import { z } from "zod";

import {
  AuctionEntrySchema,
  AuctionResultSchema,
  AuctionSchema,
  FranchiseSchema,
  PlanSchema,
  PlayerSchema,
  RetentionSchema,
  toStrict,
} from "../shared/contracts/index.ts";

/** Shape of db.seed.json and the db.json working copy (requirements §8). */
export const DatabaseSchema = toStrict(
  z.object({
    auction: AuctionSchema,
    franchises: z.array(FranchiseSchema),
    players: z.array(PlayerSchema),
    retentions: z.array(RetentionSchema),
    auctionEntries: z.array(AuctionEntrySchema),
    auctionResults: z.array(AuctionResultSchema),
    plans: z.array(PlanSchema),
  }),
);
export type Database = z.infer<typeof DatabaseSchema>;
