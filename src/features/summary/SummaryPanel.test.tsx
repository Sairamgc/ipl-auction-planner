import type { Franchise, Plan, Target } from "@shared/contracts";
import {
  type ApiResponses,
  csk,
  defaultResponses,
  emptyPlan,
  mockApi,
  rcb,
} from "@/test/apiFixtures";
import { deferred, jsonResponse } from "@/test/query";
import { renderRoute } from "@/test/render";
import { setViewport } from "@/test/viewport";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ANNOUNCE_DELAY_MS } from "./SummaryAnnouncer";

function target(id: string, expectedPriceLakh: number): Target {
  return { auctionEntryId: `2026-${id}`, expectedPriceLakh };
}

/** Plans (and optionally purses) for CSK (16 retained, 4 overseas, ₹43.40 Cr) and RCB (17, 6, ₹16.40 Cr). */
function responses({
  cskTargets = [],
  rcbTargets = [],
  purses = {},
}: {
  cskTargets?: Target[];
  rcbTargets?: Target[];
  purses?: Partial<Record<"csk" | "rcb", number>>;
} = {}): ApiResponses {
  const plans: Plan[] = [
    { ...emptyPlan("csk"), targets: cskTargets },
    { ...emptyPlan("rcb"), targets: rcbTargets },
  ];
  const franchises: Franchise[] = [rcb, csk].map((franchise) => ({
    ...franchise,
    purseRemainingLakh:
      purses[franchise.id as "csk" | "rcb"] ?? franchise.purseRemainingLakh,
  }));
  return {
    ...defaultResponses(),
    "/api/plans": plans,
    "/api/franchises": franchises,
  };
}

function summary() {
  return screen.getByRole("region", { name: "Summary" });
}

async function ready() {
  await within(
    await screen.findByRole("region", { name: "Summary" }),
  ).findByText("Max safe bid");
}

/** A metric's value text, by its label. */
function metric(label: string) {
  return within(summary()).getByText(label, { selector: "dt" })
    .nextElementSibling;
}

function maxSafeBid() {
  const label = within(summary()).getByRole("heading", {
    name: "Max safe bid",
  });
  return {
    value: label.nextElementSibling?.textContent,
    sentence: label.nextElementSibling?.nextElementSibling?.textContent,
  };
}

function statusTitles() {
  return within(summary())
    .queryAllByRole("listitem")
    .filter(
      (item) =>
        item.closest("section")?.getAttribute("aria-labelledby") !==
        "summary-rivals",
    )
    .map((item) => item.querySelector("p")?.textContent ?? "");
}

describe("SummaryPanel", () => {
  it("shows the note, figures and roles for a plan with no targets", async () => {
    mockApi(responses());
    renderRoute("/teams/csk");
    await ready();

    expect(statusTitles()).toEqual(["Note: 2 players short of the minimum"]);
    expect(
      within(summary()).getByText("Squad 16; the minimum is 18."),
    ).toBeVisible();
    expect(maxSafeBid()).toEqual({
      value: "₹43.10 Cr",
      sentence:
        "The most you can bid for your next player and still buy 1 more player at ₹30 L to reach 18.",
    });
    expect(metric("Planned spend")).toHaveTextContent(
      "₹0 L of ₹43.40 CrWithin limit₹43.40 Cr left",
    );
    expect(metric("Squad")).toHaveTextContent(
      "16 of 18–25Below the minimum2 short of the minimum",
    );
    expect(metric("Overseas")).toHaveTextContent(
      "4 of 8Within limit4 places left",
    );
    const roles = within(summary()).getByRole("region", { name: "Roles" });
    expect(
      within(roles).getByText("Batters").nextElementSibling,
    ).toHaveTextContent("16");
    expect(
      within(roles).getByText("Bowlers").nextElementSibling,
    ).toHaveTextContent("0");
  });

  it("lists rival purses without the current team, highest first", async () => {
    mockApi(responses());
    renderRoute("/teams/rcb");
    await ready();

    const rivals = within(summary()).getByRole("region", {
      name: "Rival purses",
    });
    expect(
      within(rivals)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["CSKChennai Super Kings₹43.40 Cr"]);
  });

  it("says the plan is within all limits once the minimum is reached", async () => {
    mockApi(
      responses({
        cskTargets: [target("kartik-sharma", 30), target("ravi-bishnoi", 200)],
      }),
    );
    renderRoute("/teams/csk");
    await ready();

    expect(within(summary()).getByText("Within all limits")).toBeVisible();
    expect(maxSafeBid().sentence).toBe(
      "Your squad already reaches the minimum.",
    );
    expect(metric("Squad")).toHaveTextContent(
      "18 of 18–25Within limit7 places left",
    );
  });

  it("says the next player completes the minimum when one short", async () => {
    mockApi(responses({ cskTargets: [target("kartik-sharma", 30)] }));
    renderRoute("/teams/csk");
    await ready();

    expect(maxSafeBid()).toEqual({
      value: "₹43.10 Cr",
      sentence: "Your next player completes the minimum squad.",
    });
  });

  it("shows ₹0 and the warning when one short cannot be afforded (D16, D17)", async () => {
    // RCB: 17 players, ₹20 L left, lowest base ₹30 L; the raw value is +₹20 L
    mockApi(responses({ purses: { rcb: 20 } }));
    renderRoute("/teams/rcb");
    await ready();

    expect(statusTitles()).toEqual([
      "Warning: Can't afford the minimum squad",
      "Note: 1 player short of the minimum",
    ]);
    expect(
      within(summary()).getByText(
        "₹10 L short of 1 more player at ₹30 L each.",
      ),
    ).toBeVisible();
    expect(maxSafeBid()).toEqual({
      value: "₹0 L",
      sentence: "Not enough purse left. See warnings.",
    });
  });

  it("over purse with a full squad: one warning and ₹0, no minimum-squad warning", async () => {
    mockApi(responses({ rcbTargets: [target("cameron-green", 1700)] }));
    renderRoute("/teams/rcb");
    await ready();

    expect(statusTitles()).toEqual(["Warning: Over purse by ₹60 L"]);
    expect(
      within(summary()).getByText(
        "Planned spend ₹17.00 Cr is more than the ₹16.40 Cr purse.",
      ),
    ).toBeVisible();
    expect(maxSafeBid()).toEqual({
      value: "₹0 L",
      sentence: "Not enough purse left. See warnings.",
    });
    expect(metric("Planned spend")).toHaveTextContent(
      "₹17.00 Cr of ₹16.40 CrOver the limitOver by ₹60 L",
    );
  });

  it("warns over the maximum squad and overseas cap, in §7 order", async () => {
    // RCB 17 + 9 targets = 26; overseas 6 + 3 (pool players 01, 04, 07) = 9
    const ids = Array.from(
      { length: 9 },
      (_, index) => `pool-player-${String(index + 1).padStart(2, "0")}`,
    );
    mockApi(responses({ rcbTargets: ids.map((id) => target(id, 100)) }));
    renderRoute("/teams/rcb");
    await ready();

    expect(statusTitles()).toEqual([
      "Warning: Squad over the maximum",
      "Warning: Too many overseas players",
    ]);
    // No next player to bid for: "—", read as "not applicable" (D18)
    expect(maxSafeBid()).toEqual({
      value: "—not applicable",
      sentence: "Your squad is full (26 of 25).",
    });
    expect(metric("Squad")).toHaveTextContent(
      "26 of 18–25Over the limitOver by 1",
    );
    expect(metric("Overseas")).toHaveTextContent(
      "9 of 8Over the limitOver by 1",
    );
  });

  it("follows optimistic saves and rolls back with the plan", async () => {
    const put = deferred<Response>();
    mockApi({
      ...responses({ cskTargets: [target("cameron-green", 240)] }),
      "PUT /api/plans/csk": put.promise,
    });
    const user = userEvent.setup();
    renderRoute("/teams/csk");
    await ready();
    expect(metric("Planned spend")).toHaveTextContent(/^₹2.40 Cr of/);

    await user.click(
      await screen.findByRole("button", {
        name: "Remove Cameron Green from plan",
      }),
    );
    // Before the server answers
    await waitFor(() => {
      expect(metric("Planned spend")).toHaveTextContent(/^₹0 L of/);
    });

    put.resolve(jsonResponse({ error: "Server error" }, 500));
    await waitFor(() => {
      expect(metric("Planned spend")).toHaveTextContent(/^₹2.40 Cr of/);
    });
  });

  it("shows an error with Try again when the summary can't load", async () => {
    mockApi({ ...responses(), "/api/plans/csk": 500 });
    renderRoute("/teams/csk");

    const alert = await within(
      await screen.findByRole("region", { name: "Summary" }),
    ).findByRole("alert", {}, { timeout: 5000 });
    expect(alert).toHaveTextContent("Couldn't load the summary.");
    expect(
      within(alert).getByRole("button", { name: "Try again" }),
    ).toBeVisible();
  });
});

describe("summary strip and bar", () => {
  it("shows the live figures in the tablet strip", async () => {
    setViewport("tablet");
    mockApi(responses({ purses: { rcb: 20 } }));
    renderRoute("/teams/rcb");

    const figure = async (label: string) =>
      (await screen.findByText(label, { selector: "dt" })).nextElementSibling;
    await waitFor(async () => {
      expect(await figure("Purse left")).toHaveTextContent("₹20 L");
    });
    expect(await figure("Max safe bid")).toHaveTextContent(
      "₹0 L, not enough purse left",
    );
    expect(await figure("Warnings")).toHaveTextContent("1");
  });

  it("says None when there are no warnings", async () => {
    setViewport("tablet");
    mockApi(responses());
    renderRoute("/teams/csk");

    await waitFor(() => {
      expect(
        screen.getByText("Warnings", { selector: "dt" }).nextElementSibling,
      ).toHaveTextContent("None");
    });
  });

  it("names the mobile bar with the figures and opens the Summary tab", async () => {
    setViewport("mobile");
    mockApi(responses({ purses: { rcb: 20 } }));
    const user = userEvent.setup();
    const { router } = renderRoute("/teams/rcb");

    const bar = await screen.findByRole("button", {
      name: "Purse left ₹20 L, max safe bid ₹0 L, not enough purse left, 1 warning. Open summary",
    });
    // The chevron only hints that the bar can be tapped
    expect(bar.querySelector("[data-bar-chevron]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await user.click(bar);

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ tab: "summary" });
    });
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 2, name: "Summary" }),
      ).toHaveFocus();
    });
  });
});

describe("SummaryAnnouncer", () => {
  function announcer() {
    const region = document.querySelector("[data-summary-announcer]");
    if (!region) throw new Error("No announcer");
    return region;
  }

  it("announces changes to the set of warnings, not to amounts or on load", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // RCB 17 + Cameron Green at ₹17.00 Cr: over purse by ₹60 L, no note
    mockApi(responses({ rcbTargets: [target("cameron-green", 1700)] }));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderRoute("/teams/rcb");
    await ready();
    const settle = () =>
      act(async () => {
        await vi.advanceTimersByTimeAsync(ANNOUNCE_DELAY_MS + 100);
      });
    await settle();
    expect(announcer()).toHaveTextContent("");

    // The over-purse amount changes, the set does not
    const price = screen.getByRole("textbox", {
      name: "Expected price for Cameron Green, in lakh",
    });
    await user.clear(price);
    await user.type(price, "1800{Enter}");
    await within(summary()).findByText("Over purse by ₹1.60 Cr");
    await settle();
    expect(announcer()).toHaveTextContent("");

    // Removing him clears the warning and drops the squad below the minimum
    await user.click(
      screen.getByRole("button", { name: "Remove Cameron Green from plan" }),
    );
    await settle();
    expect(announcer()).toHaveTextContent(
      "Note: 1 player short of the minimum. Cleared: over purse.",
    );

    // Undo brings the warning back
    await user.click(
      screen.getByRole("button", { name: "Undo removing Cameron Green" }),
    );
    await settle();
    expect(announcer()).toHaveTextContent(
      "Warning: Over purse by ₹1.60 Cr. Cleared: below the minimum squad.",
    );
    vi.useRealTimers();
  });

  it("stays silent after switching team", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockApi(responses({ purses: { rcb: 20 } }));
    const { router } = renderRoute("/teams/csk");
    await ready();

    await act(async () => {
      await router.navigate({
        to: "/teams/$teamId",
        params: { teamId: "rcb" },
      });
    });
    await within(summary()).findByText("Can't afford the minimum squad");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ANNOUNCE_DELAY_MS + 100);
    });
    expect(announcer()).toHaveTextContent("");
    vi.useRealTimers();
  });
});
