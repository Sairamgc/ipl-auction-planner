import { z } from "zod";

import { IdSchema, IsoDateTimeSchema, LakhSchema } from "./common.ts";

export const TargetSchema = z.object({
  auctionEntryId: IdSchema,
  /** Whole lakh. Must be at least the base price; checked where the entry is known (D10). */
  expectedPriceLakh: LakhSchema.positive(),
});
export type Target = z.infer<typeof TargetSchema>;

const planShape = {
  id: IdSchema,
  franchiseId: IdSchema,
  targets: z.array(TargetSchema),
};

/** Rules shared by the stored plan and the save request. */
function withPlanRules<
  T extends z.ZodType<{ id: string; franchiseId: string; targets: Target[] }>,
>(schema: T): T {
  return schema
    .refine((plan) => plan.id === plan.franchiseId, {
      message: "Plan id must equal franchiseId (A2)",
      path: ["id"],
    })
    .refine(
      (plan) =>
        new Set(plan.targets.map((target) => target.auctionEntryId)).size ===
        plan.targets.length,
      { message: "Each auction entry can be targeted once", path: ["targets"] },
    );
}

export const PlanSchema = withPlanRules(
  z.object({
    ...planShape,
    /** Set by the server on every save; null until the first save. */
    updatedAt: IsoDateTimeSchema.nullable(),
  }),
);
export type Plan = z.infer<typeof PlanSchema>;

/** Body of `PUT /plans/:franchiseId`. `updatedAt` is owned by the server. */
export const SavePlanRequestSchema = withPlanRules(z.object(planShape));
export type SavePlanRequest = z.infer<typeof SavePlanRequestSchema>;
