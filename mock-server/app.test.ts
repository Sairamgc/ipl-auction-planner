import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import { createMockServer } from "./app.ts";
import type { Database } from "./dbSchema.ts";
import { SEED_DB_PATH } from "./paths.ts";

const seed = JSON.parse(readFileSync(SEED_DB_PATH, "utf8")) as Database;
let server: Server | undefined;

/** Starts the real app on a free port, on an in-memory copy of the seed. */
async function start() {
  const listening = createMockServer({
    db: structuredClone(seed),
    logger: false,
  }).listen(0);
  server = listening;
  await new Promise<void>((resolve) => listening.once("listening", resolve));
  const { port } = listening.address() as AddressInfo;
  return (path: string, init?: RequestInit) =>
    fetch(`http://localhost:${String(port)}/api${path}`, init);
}

afterEach(async () => {
  await new Promise((resolve) => server?.close(resolve));
});

function put(body: unknown): RequestInit {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

const cskPlan = {
  id: "csk",
  franchiseId: "csk",
  targets: [{ auctionEntryId: "2026-cameron-green", expectedPriceLakh: 1500 }],
};

describe("mock server", () => {
  describe("GET /pool", () => {
    it("serves the seeded pool with contract defaults", async () => {
      const api = await start();
      const response = await api("/pool");
      expect(response.status).toBe(200);
      const page = (await response.json()) as {
        total: number;
        pageSize: number;
      };
      expect(page).toMatchObject({ total: 21, page: 1, pageSize: 25 });
    });

    it("filters and sorts real data", async () => {
      const api = await start();
      const response = await api(
        "/pool?role=wicketkeeper&overseas=false&sort=name",
      );
      const page = (await response.json()) as {
        items: { player: { name: string } }[];
      };
      expect(page.items.map((row) => row.player.name)).toEqual([
        "Kartik Sharma",
      ]);
    });

    it.each(["role=captain", "page=0", "colour=blue"])(
      "rejects ?%s with 400 and the issues",
      async (query) => {
        const api = await start();
        const response = await api(`/pool?${query}`);
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: "Invalid pool query",
          issues: [
            expect.objectContaining({ message: expect.any(String) as string }),
          ],
        });
      },
    );
  });

  describe("PUT /plans/:franchiseId", () => {
    it("saves the plan and sets updatedAt on the server", async () => {
      const api = await start();
      const response = await api("/plans/csk", put(cskPlan));
      expect(response.status).toBe(200);
      const saved = (await response.json()) as { updatedAt: string };
      expect(saved).toMatchObject(cskPlan);
      expect(Date.parse(saved.updatedAt)).not.toBeNaN();

      const reread = await (await api("/plans/csk")).json();
      expect(reread).toEqual(saved);
    });

    it("rejects a body with a client-sent updatedAt", async () => {
      const api = await start();
      const response = await api(
        "/plans/csk",
        put({ ...cskPlan, updatedAt: "2026-01-01T00:00:00.000Z" }),
      );
      expect(response.status).toBe(400);
    });

    it("rejects a plan that breaks the contract", async () => {
      const api = await start();
      const target = {
        auctionEntryId: "2026-cameron-green",
        expectedPriceLakh: 1500,
      };
      const response = await api(
        "/plans/csk",
        put({ ...cskPlan, targets: [target, target] }),
      );
      expect(response.status).toBe(400);
    });

    it("rejects a body whose id does not match the URL", async () => {
      const api = await start();
      const response = await api(
        "/plans/csk",
        put({ ...cskPlan, id: "rcb", franchiseId: "rcb" }),
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Plan id must match the URL",
      });
    });

    it("returns 404 for a franchise that does not exist", async () => {
      const api = await start();
      const response = await api(
        "/plans/mi",
        put({ ...cskPlan, id: "mi", franchiseId: "mi" }),
      );
      expect(response.status).toBe(404);
    });
  });

  describe("guards", () => {
    it.each([
      ["POST", "/plans", "GET"],
      ["DELETE", "/plans/csk", "GET, PUT"],
      ["PATCH", "/plans/csk", "GET, PUT"],
      ["PUT", "/franchises/csk", "GET"],
      ["POST", "/players", "GET"],
    ])("rejects %s %s with 405", async (method, path, allow) => {
      const api = await start();
      const response = await api(path, { method });
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe(allow);
    });

    it.each(["/auctionResults", "/auctionResults/2026-cameron-green"])(
      "hides %s",
      async (path) => {
        const api = await start();
        expect((await api(path)).status).toBe(404);
      },
    );

    it("still serves the read-only resources", async () => {
      const api = await start();
      for (const path of [
        "/auction",
        "/franchises",
        "/players",
        "/retentions",
        "/plans",
      ]) {
        expect((await api(path)).status).toBe(200);
      }
    });
  });
});
