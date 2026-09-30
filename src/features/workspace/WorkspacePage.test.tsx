import {
  type ApiResponses,
  defaultResponses,
  mockApi,
} from "@/test/apiFixtures";
import { deferred } from "@/test/query";
import { renderRoute } from "@/test/render";
import { setViewport } from "@/test/viewport";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

async function workspaceTitle(name: string) {
  return screen.findByRole("heading", { level: 1, name });
}

/** The inline "Before the auction" figures, by label. */
function headerFigures() {
  const value = (label: string) =>
    screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent;
  return {
    purse: value("Purse"),
    open: value("Open slots"),
    overseas: value("Overseas slots"),
  };
}

describe("WorkspacePage", () => {
  describe("header", () => {
    it("shows the team, its baseline figures and a way back", async () => {
      mockApi();
      renderRoute("/teams/csk");

      await workspaceTitle("Chennai Super Kings");
      expect(await screen.findByText("Before the auction")).toBeVisible();
      expect(headerFigures()).toEqual({
        purse: "₹43.40 Cr",
        open: "9",
        overseas: "4",
      });
      expect(screen.getByRole("link", { name: "All teams" })).toHaveAttribute(
        "href",
        "/",
      );
    });

    it("scopes team colours, with an indicator colour that stands out", async () => {
      mockApi();
      const { unmount } = renderRoute("/teams/csk");
      const csk = await workspaceTitle("Chennai Super Kings");
      const cskScope = csk.closest("[style]");
      expect(cskScope).toHaveStyle({ "--team": "#FFCB05" });
      // CSK yellow is too light to mark state; its blue is used instead
      expect(cskScope).toHaveStyle({ "--team-indicator": "#0066B3" });
      unmount();

      mockApi();
      renderRoute("/teams/rcb");
      const rcb = await workspaceTitle("Royal Challengers Bengaluru");
      expect(rcb.closest("[style]")).toHaveStyle({
        "--team-indicator": "#C90C13",
      });
    });

    it("shows the team straight away and the figures once loaded", async () => {
      const retentions = deferred<Response>();
      mockApi({ ...defaultResponses(), "/api/retentions": retentions.promise });
      renderRoute("/teams/csk");

      await workspaceTitle("Chennai Super Kings");
      expect(screen.queryByText("Before the auction")).not.toBeInTheDocument();
    });

    it("sets the page title to the team", async () => {
      mockApi();
      renderRoute("/teams/rcb");
      await workspaceTitle("Royal Challengers Bengaluru");
      await waitFor(() => {
        expect(document.title).toBe(
          "Royal Challengers Bengaluru · IPL Auction Planner",
        );
      });
    });
  });

  describe("team switcher", () => {
    it("lists every team alphabetically with the current one checked", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      screen
        .getByRole("button", {
          name: "Switch team, current: Chennai Super Kings",
        })
        .focus();
      await user.keyboard("{Enter}");

      const options = await screen.findAllByRole("menuitemradio");
      expect(options.map((option) => option.textContent)).toEqual([
        "CSKChennai Super Kings",
        "RCBRoyal Challengers Bengaluru",
      ]);
      expect(options[0]).toHaveAttribute("aria-checked", "true");
      expect(options[1]).toHaveAttribute("aria-checked", "false");
    });

    it("switches team, keeps the search params and focuses the new title", async () => {
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk?tab=plan");
      await workspaceTitle("Chennai Super Kings");

      await user.click(screen.getByRole("button", { name: /^Switch team/ }));
      await user.click(
        await screen.findByRole("menuitemradio", {
          name: /Royal Challengers Bengaluru/,
        }),
      );

      const title = await workspaceTitle("Royal Challengers Bengaluru");
      expect(router.state.location.pathname).toBe("/teams/rcb");
      expect(router.state.location.search).toEqual({ tab: "plan" });
      await waitFor(() => {
        expect(title).toHaveFocus();
      });
      await waitFor(() => {
        expect(headerFigures().purse).toBe("₹16.40 Cr");
      });
    });

    it("returns focus to the trigger when closed with Escape", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      const trigger = screen.getByRole("button", { name: /^Switch team/ });
      await user.click(trigger);
      await screen.findAllByRole("menuitemradio");
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });
  });

  describe("layout", () => {
    it("shows three panels side by side on desktop", async () => {
      mockApi();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      for (const name of ["Player pool", "My plan", "Summary"]) {
        expect(screen.getByRole("region", { name })).toBeVisible();
      }
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });

    it("makes panels that scroll on their own keyboard-focusable (UI20)", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      for (const name of ["Player pool", "My plan", "Summary"]) {
        expect(screen.getByRole("region", { name })).toHaveAttribute(
          "tabindex",
          "0",
        );
      }
      // Reached in reading order with Tab, after the header controls
      screen.getByRole("button", { name: /^Switch team/ }).focus();
      await user.tab();
      expect(screen.getByRole("region", { name: "Player pool" })).toHaveFocus();
    });

    it("shows two panels and an expandable summary strip on tablet", async () => {
      setViewport("tablet");
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      expect(screen.getByRole("region", { name: "Player pool" })).toBeVisible();
      expect(screen.getByRole("region", { name: "My plan" })).toBeVisible();
      expect(
        screen.queryByRole("region", { name: "Summary" }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Max safe bid")).toBeVisible();

      const toggle = screen.getByRole("button", { name: /Show summary/ });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      await user.click(toggle);

      expect(
        screen.getByRole("button", { name: /Hide summary/ }),
      ).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("region", { name: "Summary" })).toBeVisible();
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });

    it("shows tabs, pool first, and a mini summary on mobile", async () => {
      setViewport("mobile");
      mockApi();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      const tabs = within(
        screen.getByRole("tablist", { name: "Workspace sections" }),
      ).getAllByRole("tab");
      expect(tabs.map((tab) => tab.textContent)).toEqual([
        "Pool",
        "Plan",
        "Summary",
      ]);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("region", { name: "Player pool" })).toBeVisible();

      const miniSummary = screen.getByRole("complementary", {
        name: "Plan summary",
      });
      expect(within(miniSummary).getByText("Purse left")).toBeVisible();
      // The page scrolls on mobile, so panels are not tab stops
      expect(
        screen.getByRole("region", { name: "Player pool" }),
      ).not.toHaveAttribute("tabindex");
    });

    it("reserves the mini summary's space without announcing it twice (UI21)", async () => {
      setViewport("mobile");
      mockApi();
      renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      expect(
        screen.getAllByRole("complementary", { name: "Plan summary" }),
      ).toHaveLength(1);
      // Role queries skip aria-hidden content: the spacer copy is not exposed
      expect(
        screen
          .getAllByRole("term")
          .filter((term) => term.textContent === "Purse left"),
      ).toHaveLength(1);
      const spacer = screen.getByRole("complementary", {
        name: "Plan summary",
      }).previousElementSibling;
      expect(spacer).toHaveAttribute("aria-hidden", "true");
      expect(spacer).toHaveAttribute("inert");
    });

    it("keeps the mobile tab in the URL", async () => {
      setViewport("mobile");
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk");
      await workspaceTitle("Chennai Super Kings");

      await user.click(screen.getByRole("tab", { name: "Plan" }));
      await waitFor(() => {
        expect(router.state.location.search).toEqual({ tab: "plan" });
      });
      expect(screen.getByRole("region", { name: "My plan" })).toBeVisible();

      // Back to the default: the param is dropped
      await user.click(screen.getByRole("tab", { name: "Pool" }));
      await waitFor(() => {
        expect(router.state.location.search).toEqual({});
      });
    });

    it.each(["/teams/csk?tab=summary", "/teams/csk?tab=bogus"])(
      "opens %s on the right tab",
      async (path) => {
        setViewport("mobile");
        mockApi();
        renderRoute(path);
        await workspaceTitle("Chennai Super Kings");

        const expected = path.endsWith("summary") ? "Summary" : "Pool";
        expect(screen.getByRole("tab", { name: expected })).toHaveAttribute(
          "aria-selected",
          "true",
        );
      },
    );
  });

  describe("states", () => {
    it("shows an error with a retry when the baseline fails to load", async () => {
      const responses: ApiResponses = {
        ...defaultResponses(),
        "/api/retentions": 500,
      };
      mockApi(responses);
      const user = userEvent.setup();
      renderRoute("/teams/csk");

      await screen.findByRole("heading", { name: "Couldn't load this team." });
      responses["/api/retentions"] = defaultResponses()["/api/retentions"];
      await user.click(screen.getByRole("button", { name: "Try again" }));

      await workspaceTitle("Chennai Super Kings");
      expect(await screen.findByText("Before the auction")).toBeVisible();
    });
  });
});
