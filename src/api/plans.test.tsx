import type { Plan, Target } from "@shared/contracts";
import {
  createTestQueryClient,
  createWrapper,
  deferred,
  jsonResponse,
  mockFetch,
} from "@/test/query";
import type { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ApiError } from "./client";
import {
  planKeys,
  planQueryOptions,
  usePlan,
  usePlans,
  usePlanSaveStatus,
  useSavePlan,
} from "./plans";

const target = (id: string, price: number): Target => ({
  auctionEntryId: `2026-${id}`,
  expectedPriceLakh: price,
});

const serverPlan: Plan = {
  id: "csk",
  franchiseId: "csk",
  targets: [],
  updatedAt: null,
};

/** PUT responses the test settles by hand, in request order. */
let puts: ReturnType<typeof deferred<Response>>[];
let putBodies: unknown[];
let client: QueryClient;

beforeEach(() => {
  puts = [];
  putBodies = [];
  client = createTestQueryClient();
  mockFetch((url, init) => {
    if (init?.method === "PUT") {
      putBodies.push(
        typeof init.body === "string" ? JSON.parse(init.body) : undefined,
      );
      const response = deferred<Response>();
      puts.push(response);
      return response.promise;
    }
    if (url.pathname === "/api/plans") return jsonResponse([serverPlan]);
    return jsonResponse(serverPlan);
  });
});

function savedPlan(targets: Target[], at: string): Response {
  return jsonResponse({ ...serverPlan, targets, updatedAt: at });
}

function renderPlan() {
  return renderHook(
    () => ({
      plan: usePlan("csk"),
      save: useSavePlan("csk"),
      status: usePlanSaveStatus("csk"),
    }),
    { wrapper: createWrapper(client) },
  );
}

async function renderLoadedPlan() {
  const hook = renderPlan();
  await waitFor(() => {
    expect(hook.result.current.plan.data).toEqual(serverPlan);
  });
  return hook;
}

const targetsOf = (hook: Awaited<ReturnType<typeof renderLoadedPlan>>) =>
  hook.result.current.plan.data?.targets;

describe("plan queries", () => {
  it("loads one plan and the list", async () => {
    const { result } = renderHook(
      () => ({ one: usePlan("csk"), all: usePlans() }),
      {
        wrapper: createWrapper(client),
      },
    );
    await waitFor(() => {
      expect(result.current.all.data).toEqual([serverPlan]);
    });
    expect(result.current.one.data).toEqual(serverPlan);
  });

  it("uses normal freshness (N4)", () => {
    const options = planQueryOptions(client, "csk");
    expect(options.staleTime).toBeUndefined();
  });
});

describe("saving a plan", () => {
  it("updates the plan optimistically, before the server answers", async () => {
    const hook = await renderLoadedPlan();
    act(() => {
      hook.result.current.save([target("a", 200)]);
    });
    await waitFor(() => {
      expect(targetsOf(hook)).toEqual([target("a", 200)]);
    });
    expect(hook.result.current.status).toEqual({ state: "saving" });
  });

  it("sends the whole plan without updatedAt, and adopts the server's copy", async () => {
    const hook = await renderLoadedPlan();
    act(() => {
      hook.result.current.save([target("a", 200)]);
    });
    await waitFor(() => {
      expect(puts).toHaveLength(1);
    });
    expect(putBodies[0]).toEqual({
      id: "csk",
      franchiseId: "csk",
      targets: [target("a", 200)],
    });

    puts[0]?.resolve(savedPlan([target("a", 200)], "2026-09-30T10:00:00.000Z"));
    await waitFor(() => {
      expect(hook.result.current.status).toEqual({
        state: "saved",
        updatedAt: "2026-09-30T10:00:00.000Z",
      });
    });
    expect(hook.result.current.plan.data?.updatedAt).toBe(
      "2026-09-30T10:00:00.000Z",
    );
  });

  it("refreshes the plan list after a save, for the picker", async () => {
    const hook = await renderLoadedPlan();
    client.setQueryData(planKeys.list(), [serverPlan]);
    act(() => {
      hook.result.current.save([target("a", 200)]);
    });
    await waitFor(() => {
      expect(puts).toHaveLength(1);
    });
    puts[0]?.resolve(savedPlan([target("a", 200)], "2026-09-30T10:00:00.000Z"));
    await waitFor(() => {
      expect(client.getQueryState(planKeys.list())?.isInvalidated).toBe(true);
    });
  });

  it("sends saves one at a time, in order (A4)", async () => {
    const hook = await renderLoadedPlan();
    act(() => {
      hook.result.current.save([target("a", 200)]);
      hook.result.current.save([target("a", 200), target("b", 75)]);
    });
    await waitFor(() => {
      expect(puts).toHaveLength(1);
    });
    // The newest edit shows at once, though its request waits its turn
    expect(targetsOf(hook)).toEqual([target("a", 200), target("b", 75)]);

    puts[0]?.resolve(savedPlan([target("a", 200)], "2026-09-30T10:00:00.000Z"));
    await waitFor(() => {
      expect(puts).toHaveLength(2);
    });
    // The first response must not overwrite the newer optimistic plan
    expect(targetsOf(hook)).toEqual([target("a", 200), target("b", 75)]);

    puts[1]?.resolve(
      savedPlan(
        [target("a", 200), target("b", 75)],
        "2026-09-30T10:00:01.000Z",
      ),
    );
    await waitFor(() => {
      expect(hook.result.current.status.state).toBe("saved");
    });
    expect(hook.result.current.plan.data?.updatedAt).toBe(
      "2026-09-30T10:00:01.000Z",
    );
  });

  it("does not refetch the plan while saves are queued", async () => {
    const hook = await renderLoadedPlan();
    const options = planQueryOptions(client, "csk");
    const refetchOnFocus = options.refetchOnWindowFocus as () => boolean;
    expect(refetchOnFocus()).toBe(true);

    act(() => {
      hook.result.current.save([target("a", 200)]);
    });
    await waitFor(() => {
      expect(refetchOnFocus()).toBe(false);
    });
    puts[0]?.resolve(savedPlan([target("a", 200)], "2026-09-30T10:00:00.000Z"));
    await waitFor(() => {
      expect(refetchOnFocus()).toBe(true);
    });
  });

  describe("failures (latest wins)", () => {
    const failure = () => jsonResponse({ error: "Simulated failure" }, 500);

    it("rolls back to the last confirmed plan when the latest save fails", async () => {
      const hook = await renderLoadedPlan();
      act(() => {
        hook.result.current.save([target("a", 200)]);
      });
      await waitFor(() => {
        expect(puts).toHaveLength(1);
      });
      puts[0]?.resolve(failure());

      await waitFor(() => {
        expect(hook.result.current.status.state).toBe("error");
      });
      expect(targetsOf(hook)).toEqual([]);
      const status = hook.result.current.status;
      expect(status.state === "error" && status.error).toBeInstanceOf(ApiError);
    });

    it("keeps a newer queued save when an earlier one fails", async () => {
      const hook = await renderLoadedPlan();
      act(() => {
        hook.result.current.save([target("a", 200)]);
        hook.result.current.save([target("a", 200), target("b", 75)]);
      });
      await waitFor(() => {
        expect(puts).toHaveLength(1);
      });
      puts[0]?.resolve(failure());
      await waitFor(() => {
        expect(puts).toHaveLength(2);
      });
      // No rollback: the queued save carries the whole plan
      expect(targetsOf(hook)).toEqual([target("a", 200), target("b", 75)]);

      puts[1]?.resolve(
        savedPlan(
          [target("a", 200), target("b", 75)],
          "2026-09-30T10:00:01.000Z",
        ),
      );
      await waitFor(() => {
        expect(hook.result.current.status.state).toBe("saved");
      });
      expect(targetsOf(hook)).toEqual([target("a", 200), target("b", 75)]);
    });

    it("rolls back only to what the server last confirmed", async () => {
      const hook = await renderLoadedPlan();
      act(() => {
        hook.result.current.save([target("a", 200)]);
        hook.result.current.save([target("a", 200), target("b", 75)]);
      });
      await waitFor(() => {
        expect(puts).toHaveLength(1);
      });
      puts[0]?.resolve(
        savedPlan([target("a", 200)], "2026-09-30T10:00:00.000Z"),
      );
      await waitFor(() => {
        expect(puts).toHaveLength(2);
      });
      puts[1]?.resolve(failure());

      await waitFor(() => {
        expect(hook.result.current.status.state).toBe("error");
      });
      expect(hook.result.current.plan.data).toEqual({
        ...serverPlan,
        targets: [target("a", 200)],
        updatedAt: "2026-09-30T10:00:00.000Z",
      });
    });

    it("reports the plan that failed and the plan it rolled back to (UI54)", async () => {
      const hook = await renderLoadedPlan();
      act(() => {
        hook.result.current.save([target("a", 200)]);
      });
      await waitFor(() => {
        expect(puts).toHaveLength(1);
      });
      puts[0]?.resolve(failure());
      await waitFor(() => {
        expect(hook.result.current.status.state).toBe("error");
      });

      const status = hook.result.current.status;
      expect(status).toMatchObject({
        state: "error",
        failedTargets: [target("a", 200)],
        rolledBackTo: serverPlan.targets,
      });
      expect(targetsOf(hook)).toEqual(serverPlan.targets);
    });

    it("never retries a save by itself (N4)", async () => {
      const hook = await renderLoadedPlan();
      act(() => {
        hook.result.current.save([target("a", 200)]);
      });
      await waitFor(() => {
        expect(puts).toHaveLength(1);
      });
      puts[0]?.resolve(failure());
      await waitFor(() => {
        expect(hook.result.current.status.state).toBe("error");
      });
      expect(puts).toHaveLength(1);
    });
  });

  it("is idle before any save", async () => {
    const hook = await renderLoadedPlan();
    expect(hook.result.current.status).toEqual({ state: "idle" });
  });
});
