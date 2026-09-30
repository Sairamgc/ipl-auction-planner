import { HOME_NATIONALITY } from "../shared/contracts/index.ts";

import { contrastRatio, MIN_TEXT_CONTRAST } from "../shared/color/contrast.ts";
import { type Database, DatabaseSchema } from "./dbSchema.ts";

/**
 * Validates seed data (N3): the strict contract shape first, then the
 * cross-record rules a schema cannot express. Returns human-readable
 * problems; an empty array means the seed is valid.
 */
export function validateSeed(data: unknown): string[] {
  const parsed = DatabaseSchema.safeParse(data);
  if (!parsed.success) {
    return parsed.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
  }
  return checkIntegrity(parsed.data);
}

function checkIntegrity(db: Database): string[] {
  const problems: string[] = [];
  const report = (message: string) => problems.push(message);

  const franchiseIds = new Set(db.franchises.map((f) => f.id));
  const playersById = new Map(db.players.map((p) => [p.id, p]));
  const entriesById = new Map(db.auctionEntries.map((e) => [e.id, e]));

  reportDuplicates(
    "franchise id",
    db.franchises.map((f) => f.id),
    report,
  );
  reportDuplicates(
    "player id",
    db.players.map((p) => p.id),
    report,
  );
  reportDuplicates(
    "auction entry id",
    db.auctionEntries.map((e) => e.id),
    report,
  );
  reportDuplicates(
    "retained player",
    db.retentions.map((r) => r.playerId),
    report,
  );
  reportDuplicates(
    "auction entry for player",
    db.auctionEntries.map((e) => e.playerId),
    report,
  );
  reportDuplicates(
    "auction result for entry",
    db.auctionResults.map((r) => r.auctionEntryId),
    report,
  );
  reportDuplicates(
    "plan id",
    db.plans.map((p) => p.id),
    report,
  );

  // Team colours: each text colour must be readable on its fill (V10, N14)
  for (const { id, colors } of db.franchises) {
    for (const [fill, text] of [
      ["primary", "onPrimary"],
      ["secondary", "onSecondary"],
    ] as const) {
      const ratio = contrastRatio(colors[fill], colors[text]);
      if (ratio < MIN_TEXT_CONTRAST) {
        report(
          `franchise ${id}: ${text} on ${fill} contrast ${ratio.toFixed(2)}:1 is below ${String(MIN_TEXT_CONTRAST)}:1`,
        );
      }
    }
  }

  // Retentions reference real records and fit the squad rules
  const retainedIds = new Set<string>();
  for (const { franchiseId, playerId } of db.retentions) {
    retainedIds.add(playerId);
    if (!franchiseIds.has(franchiseId)) {
      report(`retention of ${playerId}: unknown franchise ${franchiseId}`);
    }
    if (!playersById.has(playerId)) {
      report(`retention by ${franchiseId}: unknown player ${playerId}`);
    }
  }
  const { maxSquadSize, maxOverseas, lowestBasePriceLakh } = db.auction.rules;
  for (const franchiseId of franchiseIds) {
    const retained = db.retentions
      .filter((r) => r.franchiseId === franchiseId)
      .map((r) => playersById.get(r.playerId));
    const overseas = retained.filter(
      (p) => p !== undefined && p.nationality !== HOME_NATIONALITY,
    ).length;
    if (retained.length > maxSquadSize) {
      report(
        `franchise ${franchiseId}: ${String(retained.length)} retained exceeds max squad ${String(maxSquadSize)}`,
      );
    }
    if (overseas > maxOverseas) {
      report(
        `franchise ${franchiseId}: ${String(overseas)} overseas retained exceeds cap ${String(maxOverseas)}`,
      );
    }
  }

  // Pool entries reference real, unretained players at a valid base price
  const pooledIds = new Set<string>();
  for (const entry of db.auctionEntries) {
    pooledIds.add(entry.playerId);
    if (!playersById.has(entry.playerId)) {
      report(`auction entry ${entry.id}: unknown player ${entry.playerId}`);
    }
    if (retainedIds.has(entry.playerId)) {
      report(`auction entry ${entry.id}: player ${entry.playerId} is retained`);
    }
    if (entry.basePriceLakh < lowestBasePriceLakh) {
      report(
        `auction entry ${entry.id}: base ${String(entry.basePriceLakh)} is below the lowest base ${String(lowestBasePriceLakh)}`,
      );
    }
  }

  // Every player is either retained or in the pool
  for (const { id } of db.players) {
    if (!retainedIds.has(id) && !pooledIds.has(id)) {
      report(`player ${id}: neither retained nor in the pool`);
    }
  }

  // Every pool entry has exactly one result; sold prices are valid
  const resultEntryIds = new Set(
    db.auctionResults.map((r) => r.auctionEntryId),
  );
  for (const entry of db.auctionEntries) {
    if (!resultEntryIds.has(entry.id)) {
      report(`auction entry ${entry.id}: no auction result`);
    }
  }
  for (const result of db.auctionResults) {
    const entry = entriesById.get(result.auctionEntryId);
    if (!entry) {
      report(`auction result: unknown entry ${result.auctionEntryId}`);
      continue;
    }
    if (result.status === "sold") {
      // Sales name a franchise in the data (FU1)
      if (!franchiseIds.has(result.franchiseId)) {
        report(
          `auction result ${result.auctionEntryId}: unknown franchise ${result.franchiseId}`,
        );
      }
      if (result.priceLakh < entry.basePriceLakh) {
        report(
          `auction result ${result.auctionEntryId}: price ${String(result.priceLakh)} is below base ${String(entry.basePriceLakh)}`,
        );
      }
    }
  }

  // Plans are seeded empty, one per franchise (A2)
  for (const franchiseId of franchiseIds) {
    if (!db.plans.some((plan) => plan.id === franchiseId)) {
      report(`franchise ${franchiseId}: no plan`);
    }
  }
  for (const plan of db.plans) {
    if (!franchiseIds.has(plan.franchiseId)) {
      report(`plan ${plan.id}: unknown franchise ${plan.franchiseId}`);
    }
    if (plan.targets.length > 0 || plan.updatedAt !== null) {
      report(`plan ${plan.id}: seeded plans must be empty and never saved`);
    }
  }

  return problems;
}

function reportDuplicates(
  label: string,
  values: string[],
  report: (message: string) => void,
) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) report(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
}
