import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import {
  describeSimulation,
  NO_SIMULATION,
  parseSimulationArgs,
  simulationMiddleware,
} from "./simulation.ts";

describe("parseSimulationArgs", () => {
  it("is off without arguments", () => {
    expect(parseSimulationArgs([])).toEqual(NO_SIMULATION);
  });

  it("reads a fixed delay, a delay range and a fail rate", () => {
    expect(parseSimulationArgs(["--delay", "800"])).toEqual({
      delay: { minMs: 800, maxMs: 800 },
      failRate: 0,
    });
    expect(
      parseSimulationArgs(["--delay", "300-1200", "--fail-rate", "0.2"]),
    ).toEqual({ delay: { minMs: 300, maxMs: 1200 }, failRate: 0.2 });
  });

  it.each([
    [["--delay", "fast"]],
    [["--delay", "1200-300"]],
    [["--delay", "-5"]],
    [["--fail-rate", "1.5"]],
    [["--fail-rate", "often"]],
    [["--latency", "100"]],
  ])("rejects %j", (args) => {
    expect(() => parseSimulationArgs(args)).toThrow();
  });
});

describe("describeSimulation", () => {
  it("describes what is simulated", () => {
    expect(describeSimulation(NO_SIMULATION)).toBeNull();
    expect(
      describeSimulation({ delay: { minMs: 300, maxMs: 1200 }, failRate: 0.2 }),
    ).toBe("Simulating: delay 300–1200 ms, fail rate 0.2");
    expect(
      describeSimulation({ delay: { minMs: 800, maxMs: 800 }, failRate: 0 }),
    ).toBe("Simulating: delay 800 ms");
  });
});

describe("simulationMiddleware", () => {
  function run(
    options: Parameters<typeof simulationMiddleware>[0],
    randomValues: number[],
  ) {
    const random = vi.fn(() => randomValues.shift() ?? 0);
    const sleep = vi.fn(() => Promise.resolve());
    const res = { status: vi.fn(), json: vi.fn() };
    res.status.mockReturnValue(res);
    const next = vi.fn<() => void>();
    simulationMiddleware(options, { random, sleep })(
      {} as Request,
      res as unknown as Response,
      next,
    );
    return { sleep, res, next };
  }

  it("passes requests straight through when off", async () => {
    const { sleep, next } = run(NO_SIMULATION, []);
    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledOnce();
    });
    expect(sleep).toHaveBeenCalledWith(0);
  });

  it("delays by a random amount within the range", async () => {
    const options = { delay: { minMs: 300, maxMs: 1200 }, failRate: 0 };
    const low = run(options, [0]);
    const high = run(options, [0.9999]);
    await vi.waitFor(() => {
      expect(high.next).toHaveBeenCalled();
    });
    expect(low.sleep).toHaveBeenCalledWith(300);
    expect(high.sleep).toHaveBeenCalledWith(1200);
  });

  it("fails a request with a 500 at the given rate", async () => {
    const options = { delay: null, failRate: 0.2 };
    const failed = run(options, [0.1]);
    const passed = run(options, [0.5]);
    await vi.waitFor(() => {
      expect(failed.res.json).toHaveBeenCalledWith({
        error: "Simulated failure",
      });
      expect(passed.next).toHaveBeenCalledOnce();
    });
    expect(failed.res.status).toHaveBeenCalledWith(500);
    expect(failed.next).not.toHaveBeenCalled();
  });
});
