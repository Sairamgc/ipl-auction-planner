import { describe, expect, it } from "vitest";

import { planStatusLabel } from "./planStatusLabel";

describe("planStatusLabel", () => {
  it.each([
    [{ kind: "not-started" } as const, "Not started"],
    [{ kind: "in-progress", targetCount: 1 } as const, "1 target"],
    [{ kind: "in-progress", targetCount: 3 } as const, "3 targets"],
  ])("labels %j as %s", (status, label) => {
    expect(planStatusLabel(status)).toBe(label);
  });
});
