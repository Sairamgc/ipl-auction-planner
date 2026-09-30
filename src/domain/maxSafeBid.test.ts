import { makeRules } from "@/test/factories";
import { describe, expect, it } from "vitest";

import { maxSafeBid } from "./maxSafeBid";

const rules = makeRules(); // min 18, lowest base 30

describe("maxSafeBid", () => {
  it("reserves the lowest base price for every other slot still needed", () => {
    // 16 in squad: bidding for the 17th leaves 1 slot to fill at 30
    expect(maxSafeBid(4340, 16, rules)).toBe(4310);
    // 10 in squad: the 11th leaves 7 slots, 7 × 30 = 210
    expect(maxSafeBid(1000, 10, rules)).toBe(790);
  });

  it("reserves nothing once the next player completes the minimum", () => {
    expect(maxSafeBid(500, 17, rules)).toBe(500);
    expect(maxSafeBid(500, 18, rules)).toBe(500);
    expect(maxSafeBid(500, 24, rules)).toBe(500);
  });

  it("goes negative when the purse cannot cover the minimum squad", () => {
    expect(maxSafeBid(50, 10, rules)).toBe(-160);
  });

  it("uses the auction's own rules", () => {
    const smaller = makeRules({ minSquadSize: 12, lowestBasePriceLakh: 20 });
    expect(maxSafeBid(1000, 5, smaller)).toBe(1000 - 6 * 20);
  });
});
