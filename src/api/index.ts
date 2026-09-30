/**
 * Typed data access for the app. Components never call fetch; they use the
 * hooks here, built on the Zod-validated client (API rules in CLAUDE.md).
 */
export * from "./auction";
export * from "./auctionEntries";
export * from "./client";
export * from "./franchises";
export * from "./plans";
export * from "./players";
export * from "./pool";
export * from "./queryDefaults";
export * from "./retentions";
export * from "./retry";
