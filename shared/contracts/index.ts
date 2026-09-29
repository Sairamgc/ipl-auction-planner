/**
 * API contracts: Zod schemas and their inferred types for every resource,
 * request and response, shared by the mock server and the app (F2).
 * Schemas strip unknown keys; use `toStrict` where unknown keys must fail.
 */
export * from "./auction.ts";
export * from "./auctionEntry.ts";
export * from "./auctionResult.ts";
export * from "./common.ts";
export * from "./franchise.ts";
export * from "./plan.ts";
export * from "./player.ts";
export * from "./pool.ts";
export * from "./retention.ts";
export * from "./strict.ts";
