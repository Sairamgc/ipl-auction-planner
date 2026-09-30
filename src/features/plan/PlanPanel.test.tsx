import type { Plan } from "@shared/contracts";
import {
  type ApiResponses,
  defaultResponses,
  emptyPlan,
  mockApi,
} from "@/test/apiFixtures";
import { deferred, jsonResponse, urlOf } from "@/test/query";
import { renderRoute } from "@/test/render";
import { setViewport } from "@/test/viewport";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UNDO_MS } from "./PlanPanel";

function plan() {
  return screen.getByRole("region", { name: "My plan" });
}

/** CSK's plan with Cameron Green (batter, base 200) and two bowlers. */
function withTargets(): ApiResponses {
  const csk: Plan = {
    ...emptyPlan("csk"),
    targets: [
      { auctionEntryId: "2026-cameron-green", expectedPriceLakh: 240 },
      { auctionEntryId: "2026-jacob-duffy", expectedPriceLakh: 200 },
      { auctionEntryId: "2026-ravi-bishnoi", expectedPriceLakh: 300 },
    ],
  };
  return { ...defaultResponses(), "/api/plans": [csk, emptyPlan("rcb")] };
}

function saves(fetchMock: ReturnType<typeof mockApi>) {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === "PUT")
    .map(([input, init]) => ({
      path: urlOf(input).pathname,
      targets: (
        JSON.parse(typeof init?.body === "string" ? init.body : "{}") as Plan
      ).targets,
    }));
}

async function ready() {
  await within(
    await screen.findByRole("region", { name: "My plan" }),
  ).findByRole("heading", { name: /^Batters/ });
}

function priceInput(name: string) {
  return within(plan()).getByRole("textbox", {
    name: `Expected price for ${name}, in lakh`,
  });
}

describe("PlanPanel", () => {
  describe("layout", () => {
    it("shows the retained squad, locked, and an empty hint", async () => {
      mockApi();
      renderRoute("/teams/csk");
      await ready();

      expect(within(plan()).getByText(/^No targets yet/)).toBeVisible();
      const batters = within(plan()).getByRole("region", {
        name: "Batters · 16",
      });
      expect(within(batters).getAllByText("Retained")).toHaveLength(16);
      expect(within(plan()).queryAllByRole("textbox")).toHaveLength(0);
    });

    it("groups targets with the retained players by role, highest price first (D7)", async () => {
      mockApi(withTargets());
      renderRoute("/teams/csk");
      await ready();

      expect(
        within(plan())
          .getAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(["Batters · 17", "Bowlers · 2"]);
      const bowlers = within(plan()).getByRole("region", {
        name: "Bowlers · 2",
      });
      expect(
        within(bowlers)
          .getAllByRole("button", { name: /view details$/ })
          .map((button) => button.textContent),
      ).toEqual(["Ravi Bishnoi", "Jacob Duffy"]);
      expect(
        within(plan()).queryByText(/^No targets yet/),
      ).not.toBeInTheDocument();
    });

    it("opens the detail dialog from retained and target rows", async () => {
      mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Cameron Green, view details",
        }),
      );
      const target = await screen.findByRole("dialog", {
        name: "Cameron Green",
      });
      expect(within(target).getByText("Base price")).toBeVisible();
      await user.keyboard("{Escape}");

      const retained = within(plan()).getAllByRole("button", {
        name: /view details$/,
      })[0];
      if (!retained) throw new Error("no retained row");
      await user.click(retained);
      const dialog = await screen.findByRole("dialog");
      expect(within(dialog).queryByText("Base price")).not.toBeInTheDocument();
    });

    it("offers a way to the pool from the empty hint on mobile", async () => {
      setViewport("mobile");
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk?tab=plan");
      await ready();

      await user.click(
        within(plan()).getByRole("button", { name: "Go to Pool" }),
      );
      await waitFor(() => {
        expect(router.state.location.href).toBe("/teams/csk");
      });
      expect(screen.getByRole("tab", { name: "Pool" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  describe("inline price editing", () => {
    it("saves a changed price on Enter", async () => {
      const fetchMock = mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "260{Enter}");

      await waitFor(() => {
        expect(saves(fetchMock)).toHaveLength(1);
      });
      expect(saves(fetchMock)[0]?.targets[0]).toEqual({
        auctionEntryId: "2026-cameron-green",
        expectedPriceLakh: 260,
      });
    });

    it("saves on blur, and does nothing when the price is unchanged", async () => {
      const fetchMock = mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(priceInput("Cameron Green"));
      await user.tab();
      expect(saves(fetchMock)).toHaveLength(0);

      const input = priceInput("Jacob Duffy");
      await user.clear(input);
      await user.type(input, "210");
      await user.tab();
      await waitFor(() => {
        expect(saves(fetchMock)).toHaveLength(1);
      });
    });

    it("shows an error for an invalid price and saves nothing (A5)", async () => {
      const fetchMock = mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "150{Enter}");

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription(
        expect.stringContaining("At least the base price, ₹2.00 Cr."),
      );
      expect(saves(fetchMock)).toHaveLength(0);
    });

    it("puts back the saved price on Escape", async () => {
      mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "15{Enter}{Escape}");

      expect(input).toHaveValue("240");
      expect(input).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("removing", () => {
    it("saves at once, offers Undo with focus, and restores the old price", async () => {
      const fetchMock = mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Remove Cameron Green from plan",
        }),
      );
      const undo = await within(plan()).findByRole("button", {
        name: "Undo removing Cameron Green",
      });
      await waitFor(() => {
        expect(undo).toHaveFocus();
      });
      expect(within(plan()).getByText("Cameron Green removed.")).toBeVisible();
      expect(saves(fetchMock)[0]?.targets.map((t) => t.auctionEntryId)).toEqual(
        ["2026-jacob-duffy", "2026-ravi-bishnoi"],
      );

      await user.click(undo);
      await waitFor(() => {
        expect(priceInput("Cameron Green")).toHaveValue("240");
      });
      await waitFor(() => {
        expect(
          within(plan()).getByRole("button", {
            name: "Cameron Green, view details",
          }),
        ).toHaveFocus();
      });
      expect(saves(fetchMock)).toHaveLength(2);
    });

    it("ends Undo after 10 seconds without stranding focus", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      mockApi(withTargets());
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Remove Jacob Duffy from plan",
        }),
      );
      await within(plan()).findByRole("button", { name: /^Undo/ });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(UNDO_MS + 100);
      });
      expect(
        within(plan()).queryByRole("button", { name: /^Undo/ }),
      ).not.toBeInTheDocument();
      await waitFor(() => {
        expect(
          within(plan()).getByRole("heading", { name: "My plan" }),
        ).toHaveFocus();
      });
      vi.useRealTimers();
    });

    it("ends Undo when the plan changes in another way", async () => {
      mockApi(withTargets());
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Remove Jacob Duffy from plan",
        }),
      );
      await within(plan()).findByRole("button", { name: /^Undo/ });
      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "250{Enter}");

      await waitFor(() => {
        expect(
          within(plan()).queryByRole("button", { name: /^Undo/ }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("save status", () => {
    it("shows Saving… then Saved", async () => {
      const put = deferred<Response>();
      const responses = { ...withTargets(), "PUT /api/plans/csk": put.promise };
      mockApi(responses);
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "250{Enter}");
      expect(await within(plan()).findByText("Saving…")).toBeVisible();

      await act(async () => {
        put.resolve(
          jsonResponse({
            ...emptyPlan("csk"),
            targets: [
              { auctionEntryId: "2026-cameron-green", expectedPriceLakh: 250 },
            ],
            updatedAt: "2026-09-30T10:00:00.000Z",
          }),
        );
        await put.promise;
      });
      expect(await within(plan()).findByText("Saved")).toBeVisible();
    });

    it("rolls back a failed save, explains it, and retries the failed plan (N30)", async () => {
      const responses: ApiResponses = {
        ...withTargets(),
        "PUT /api/plans/csk": 500,
      };
      const fetchMock = mockApi(responses);
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "250{Enter}");

      const alert = await within(plan()).findByRole("alert");
      expect(alert).toHaveTextContent("Couldn't save your last change.");
      // Rolled back to the last saved price
      await waitFor(() => {
        expect(priceInput("Cameron Green")).toHaveValue("240");
      });

      // The server recovers; Try again resends the plan that failed
      delete responses["PUT /api/plans/csk"];
      await user.click(
        within(alert).getByRole("button", { name: "Try again" }),
      );
      await waitFor(() => {
        expect(within(plan()).queryByRole("alert")).not.toBeInTheDocument();
      });
      const sent = saves(fetchMock);
      expect(sent.at(-1)?.targets[0]?.expectedPriceLakh).toBe(250);
      await waitFor(() => {
        expect(priceInput("Cameron Green")).toHaveValue("250");
      });
    });

    it("keeps the error until dismissed", async () => {
      mockApi({ ...withTargets(), "PUT /api/plans/csk": 500 });
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Remove Jacob Duffy from plan",
        }),
      );
      const alert = await within(plan()).findByRole("alert");
      await user.click(within(alert).getByRole("button", { name: "Dismiss" }));

      expect(within(plan()).queryByRole("alert")).not.toBeInTheDocument();
      expect(within(plan()).getByText("Last change not saved")).toBeVisible();
      expect(
        within(plan()).getByRole("heading", { name: "My plan" }),
      ).toHaveFocus();
    });

    it("clears the error when a later save succeeds", async () => {
      const responses: ApiResponses = {
        ...withTargets(),
        "PUT /api/plans/csk": 500,
      };
      mockApi(responses);
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await ready();

      await user.click(
        within(plan()).getByRole("button", {
          name: "Remove Jacob Duffy from plan",
        }),
      );
      await within(plan()).findByRole("alert");

      delete responses["PUT /api/plans/csk"];
      const input = priceInput("Cameron Green");
      await user.clear(input);
      await user.type(input, "250{Enter}");

      await waitFor(() => {
        expect(within(plan()).queryByRole("alert")).not.toBeInTheDocument();
      });
      expect(await within(plan()).findByText("Saved")).toBeVisible();
    });
  });
});
