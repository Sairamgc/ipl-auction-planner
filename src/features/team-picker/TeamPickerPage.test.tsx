import {
  type ApiResponses,
  csk,
  defaultResponses,
  emptyPlan,
  mockApi,
} from "@/test/apiFixtures";
import { deferred, urlOf } from "@/test/query";
import { renderRoute } from "@/test/render";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/** The loaded team cards (the skeleton list is a different element). */
async function teamCards() {
  const list = await waitFor(() => {
    const current = screen.getByRole("list", { name: "Teams" });
    expect(current).not.toHaveAttribute("aria-busy");
    return current;
  });
  return within(list).getAllByRole("listitem");
}

describe("TeamPickerPage", () => {
  it("shows skeleton cards while loading", async () => {
    mockApi({
      ...defaultResponses(),
      "/api/plans": deferred<Response>().promise,
    });
    renderRoute("/");

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Loading teams…",
    );
    const list = screen.getByRole("list", { name: "Teams" });
    expect(list).toHaveAttribute("aria-busy", "true");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(within(list).queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows one card per franchise, in alphabetical order", async () => {
    mockApi();
    renderRoute("/");

    const cards = await teamCards();
    expect(
      cards.map((card) => within(card).getByRole("heading").textContent),
    ).toEqual(["Chennai Super Kings", "Royal Challengers Bengaluru"]);
    expect(
      screen.getByText("IPL 2026 Player Auction · 16 Dec 2025"),
    ).toBeVisible();
  });

  it("shows each franchise's baseline figures and plan status", async () => {
    mockApi({
      ...defaultResponses(),
      "/api/plans": [
        emptyPlan("csk"),
        {
          ...emptyPlan("rcb"),
          targets: ["a", "b", "c"].map((id) => ({
            auctionEntryId: `2026-${id}`,
            expectedPriceLakh: 100,
          })),
        },
      ],
    });
    renderRoute("/");

    const [cskCard, rcbCard] = await teamCards();
    const figures = (card: HTMLElement | undefined) => {
      const view = within(card ?? document.body);
      return {
        purse: view.getByText("Purse").nextElementSibling?.textContent,
        open: view.getByText("Open slots").nextElementSibling?.textContent,
        overseas:
          view.getByText("Overseas slots").nextElementSibling?.textContent,
      };
    };
    expect(figures(cskCard)).toEqual({
      purse: "₹43.40 Cr",
      open: "9",
      overseas: "4",
    });
    expect(figures(rcbCard)).toEqual({
      purse: "₹16.40 Cr",
      open: "8",
      overseas: "2",
    });
    expect(
      within(cskCard ?? document.body).getByText("Not started"),
    ).toBeVisible();
    expect(
      within(rcbCard ?? document.body).getByText("3 targets"),
    ).toBeVisible();
    expect(
      within(cskCard ?? document.body).getByText("Before the auction"),
    ).toBeVisible();
  });

  it("links each card to its workspace, named by the team only", async () => {
    mockApi();
    renderRoute("/");
    await teamCards();

    expect(
      screen.getByRole("link", { name: "Chennai Super Kings" }),
    ).toHaveAttribute("href", "/teams/csk");
    expect(
      screen.getByRole("link", { name: "Royal Challengers Bengaluru" }),
    ).toHaveAttribute("href", "/teams/rcb");
  });

  it("scopes each card's team colours and shows the initials badge", async () => {
    mockApi();
    renderRoute("/");
    const [cskCard] = await teamCards();

    const card = cskCard?.querySelector('[data-slot="card"]');
    expect(card).toHaveStyle({ "--team": csk.colors.primary });
    expect(card).toHaveStyle({ "--team-foreground": csk.colors.onPrimary });
    expect(within(cskCard ?? document.body).getByText("CSK")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("opens the workspace with the keyboard", async () => {
    mockApi();
    const user = userEvent.setup();
    const { router } = renderRoute("/");
    await teamCards();

    screen.getByRole("link", { name: "Royal Challengers Bengaluru" }).focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/teams/rcb");
    });
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Royal Challengers Bengaluru",
      }),
    ).toBeVisible();
  });

  it("shows an error with a retry that refetches only what failed", async () => {
    const responses: ApiResponses = {
      ...defaultResponses(),
      "/api/plans": 500,
    };
    const fetchMock = mockApi(responses);
    const user = userEvent.setup();
    renderRoute("/");

    const title = await screen.findByRole("heading", {
      name: "Couldn't load teams.",
    });
    await waitFor(() => {
      expect(title).toHaveFocus();
    });

    responses["/api/plans"] = [emptyPlan("csk"), emptyPlan("rcb")];
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await teamCards()).toHaveLength(2);
    const calls = fetchMock.mock.calls.map(([input]) => urlOf(input).pathname);
    expect(calls.filter((path) => path === "/api/plans")).toHaveLength(2);
    expect(calls.filter((path) => path === "/api/franchises")).toHaveLength(1);
  });

  it("shows an empty state when there are no franchises", async () => {
    mockApi({ ...defaultResponses(), "/api/franchises": [] });
    renderRoute("/");

    expect(await screen.findByText("No teams available yet.")).toBeVisible();
    expect(
      screen.queryByRole("list", { name: "Teams" }),
    ).not.toBeInTheDocument();
  });

  it("treats a franchise without a plan as not started", async () => {
    mockApi({ ...defaultResponses(), "/api/plans": [] });
    renderRoute("/");

    const cards = await teamCards();
    for (const card of cards) {
      expect(within(card).getByText("Not started")).toBeVisible();
    }
  });

  it("returns to the picker from the app header", async () => {
    mockApi();
    const user = userEvent.setup();
    const { router } = renderRoute("/teams/csk");
    await screen.findByRole("heading", {
      level: 1,
      name: "Chennai Super Kings",
    });

    await user.click(screen.getByRole("link", { name: "IPL Auction Planner" }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
  });
});
