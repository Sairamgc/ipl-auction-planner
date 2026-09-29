import { z } from "zod";

import { IdSchema, IsoDateSchema, LakhSchema } from "./common.ts";

export const SquadRulesSchema = z
  .object({
    minSquadSize: z.number().int().positive(),
    maxSquadSize: z.number().int().positive(),
    maxOverseas: z.number().int().nonnegative(),
    lowestBasePriceLakh: LakhSchema.positive(),
  })
  .refine((rules) => rules.minSquadSize <= rules.maxSquadSize, {
    message: "minSquadSize must not exceed maxSquadSize",
    path: ["minSquadSize"],
  })
  .refine((rules) => rules.maxOverseas <= rules.maxSquadSize, {
    message: "maxOverseas must not exceed maxSquadSize",
    path: ["maxOverseas"],
  });
export type SquadRules = z.infer<typeof SquadRulesSchema>;

export const AuctionSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  season: z.number().int(),
  auctionDate: IsoDateSchema,
  rules: SquadRulesSchema,
});
export type Auction = z.infer<typeof AuctionSchema>;
