import {
  type ApiResponses,
  defaultResponses,
  mockApi,
  poolResponse,
} from "@/test/apiFixtures";
import { deferred, jsonResponse, urlOf } from "@/test/query";
import { renderRoute } from "@/test/render";
import { setViewport } from "@/test/viewport";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

function pool() {
  return screen.getByRole("region", { name: "Player pool" });
}

/** Player names in the order shown (table or list). */
function shownNames() {
  return within(pool())
    .queryAllByRole("button", { name: /, view details$/ })
    .map((button) => button.textContent.replace(", view details", ""));
}

async function loaded(count = 25) {
  await waitFor(() => {
    expect(shownNames()).toHaveLength(count);
  });
}

/** The /api/pool requests made so far, as query objects. */
function poolRequests(fetchMock: ReturnType<typeof mockApi>) {
  return fetchMock.mock.calls
    .map(([input]) => urlOf(input))
    .filter((url) => url.pathname === "/api/pool")
    .map((url) => Object.fromEntries(url.searchParams));
}

describe("PoolPanel", () => {
  describe("results", () => {
    it("shows the first page, sorted by base price, with a count", async () => {
      mockApi();
      renderRoute("/teams/csk");
      await loaded();

      expect(within(pool()).getByText("30 players")).toBeVisible();
      expect(shownNames()[0]).toBe("Cameron Green");
      const headers = within(pool()).getAllByRole("columnheader");
      expect(headers.map((header) => header.textContent)).toEqual([
        "Player",
        "Role",
        "Age",
        "Base price",
      ]);
      expect(
        within(pool()).getByRole("columnheader", { name: "Base price" }),
      ).toHaveAttribute("aria-sort", "descending");
    });

    it("loads more on request and moves focus to the first new player", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await loaded();

      await user.click(
        within(pool()).getByRole("button", { name: "Load more" }),
      );

      await loaded(30);
      await waitFor(() => {
        expect(document.activeElement?.textContent).toContain(shownNames()[25]);
      });
      expect(
        within(pool()).getByText("5 players more loaded"),
      ).toBeInTheDocument();
      expect(
        within(pool()).queryByRole("button", { name: "Load more" }),
      ).not.toBeInTheDocument();
    });

    it("keeps loaded players and offers a retry when the next page fails", async () => {
      let failPageTwo = true;
      mockApi({
        ...defaultResponses(),
        "/api/pool": (url: URL) =>
          url.searchParams.get("page") === "2" && failPageTwo
            ? jsonResponse({ error: "Simulated failure" }, 500)
            : poolResponse(url),
      });
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await loaded();

      await user.click(
        within(pool()).getByRole("button", { name: "Load more" }),
      );
      const alert = await within(pool()).findByRole("alert");
      expect(alert).toHaveTextContent("Couldn't load more players.");
      expect(shownNames()).toHaveLength(25);

      failPageTwo = false;
      await user.click(
        within(alert).getByRole("button", { name: "Try again" }),
      );
      await loaded(30);
    });

    it("shows an error in the panel, without taking focus, and retries", async () => {
      const responses: ApiResponses = {
        ...defaultResponses(),
        "/api/pool": 500,
      };
      mockApi(responses);
      const user = userEvent.setup();
      renderRoute("/teams/csk");

      const alert = await within(
        await screen.findByRole("region", { name: "Player pool" }),
      ).findByRole("alert");
      expect(alert).toHaveTextContent("Couldn't load players.");
      expect(within(alert).getByRole("heading")).not.toHaveFocus();

      responses["/api/pool"] = poolResponse;
      await user.click(
        within(alert).getByRole("button", { name: "Try again" }),
      );
      await loaded();
    });

    it("shows an empty state that clears the filters", async () => {
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk?search=zzz&role=bowler");

      expect(
        await within(
          await screen.findByRole("region", { name: "Player pool" }),
        ).findByText("No players match these filters."),
      ).toBeVisible();
      await user.click(
        within(pool()).getByRole("button", { name: "Clear filters" }),
      );

      await loaded();
      expect(router.state.location.search).toEqual({});
    });

    it("keeps the previous results while new ones load", async () => {
      const bowlers = deferred<Response>();
      mockApi({
        ...defaultResponses(),
        "/api/pool": (url: URL) =>
          url.searchParams.get("role") === "bowler"
            ? bowlers.promise
            : poolResponse(url),
      });
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await loaded();

      await user.click(
        within(pool()).getByRole("button", { name: /^Filters/ }),
      );
      await user.click(await screen.findByRole("checkbox", { name: "Bowler" }));

      // Still the old rows, marked busy
      expect(shownNames()).toHaveLength(25);
      expect(within(pool()).getByRole("table")).toHaveAttribute(
        "aria-busy",
        "true",
      );

      await act(async () => {
        bowlers.resolve(poolResponse(new URL("http://x/api/pool?role=bowler")));
        await bowlers.promise;
      });
      await waitFor(() => {
        expect(within(pool()).getByRole("table")).not.toHaveAttribute(
          "aria-busy",
        );
      });
    });
  });

  describe("search, filters and sort in the URL", () => {
    it("sends the search once, 300 ms after typing stops", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const fetchMock = mockApi();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { router } = renderRoute("/teams/csk");
      await loaded();

      await user.type(
        within(pool()).getByRole("searchbox", { name: "Search players" }),
        "green",
      );
      expect(poolRequests(fetchMock).some((query) => query.search)).toBe(false);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      await waitFor(() => {
        expect(router.state.location.search).toEqual({ search: "green" });
      });
      await waitFor(() => {
        expect(shownNames()).toEqual(["Cameron Green"]);
      });
      expect(poolRequests(fetchMock).filter((query) => query.search)).toEqual([
        expect.objectContaining({ search: "green", page: "1" }),
      ]);
      vi.useRealTimers();
    });

    it("applies a filter at once, shows it as a chip, and counts it", async () => {
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk");
      await loaded();

      await user.click(within(pool()).getByRole("button", { name: "Filters" }));
      await user.click(
        await screen.findByRole("checkbox", { name: "Wicketkeeper" }),
      );
      await user.click(screen.getByRole("radio", { name: "Indian" }));

      await waitFor(() => {
        // The URL uses the API's own format (UI24)
        expect(router.state.location.href).toBe(
          "/teams/csk?role=wicketkeeper&overseas=false",
        );
      });
      expect(
        within(pool()).getByRole("button", { name: "Filters (2)" }),
      ).toBeInTheDocument();
      const chips = within(pool()).getByRole("list", {
        name: "Active filters",
      });
      expect(
        within(chips)
          .getAllByRole("button")
          .map((chip) => chip.textContent),
      ).toEqual(["Role: Wicketkeeper", "Indian"]);
    });

    it("removes one filter with its chip, or all with Clear all", async () => {
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute(
        "/teams/csk?role=batter,bowler&capped=false&sort=name",
      );
      await waitFor(() => {
        expect(
          within(pool()).getByRole("list", { name: "Active filters" }),
        ).toBeVisible();
      });

      await user.click(
        within(pool()).getByRole("button", {
          name: "Remove filter: Role: Bowler",
        }),
      );
      await waitFor(() => {
        expect(router.state.location.href).toBe(
          "/teams/csk?role=batter&capped=false&sort=name",
        );
      });

      await user.click(
        within(pool()).getByRole("button", { name: "Clear all" }),
      );
      await waitFor(() => {
        // Sort is not a filter: it stays
        expect(router.state.location.href).toBe("/teams/csk?sort=name");
      });
    });

    it("restores every control from a link", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute(
        "/teams/csk?search=pool&role=bowler,wicketkeeper&overseas=false&minBase=75&maxBase=200&sort=name&order=desc",
      );
      await waitFor(() => {
        expect(shownNames().length).toBeGreaterThan(0);
      });

      expect(within(pool()).getByRole("searchbox")).toHaveValue("pool");
      expect(
        within(pool()).getByRole("combobox", { name: "Sort by" }),
      ).toHaveTextContent("Name: Z to A");
      await user.click(
        within(pool()).getByRole("button", { name: "Filters (3)" }),
      );
      expect(
        await screen.findByRole("checkbox", { name: "Bowler" }),
      ).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Wicketkeeper" }),
      ).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: "Batter" }),
      ).not.toBeChecked();
      expect(screen.getByRole("radio", { name: "Indian" })).toBeChecked();
      expect(screen.getByRole("combobox", { name: "From" })).toHaveTextContent(
        "₹75 L",
      );
      expect(screen.getByRole("combobox", { name: "Up to" })).toHaveTextContent(
        "₹2.00 Cr",
      );
    });

    it("ignores invalid values in a link", async () => {
      const fetchMock = mockApi();
      renderRoute("/teams/csk?role=captain&minBase=abc&sort=up&overseas=maybe");
      await loaded();

      expect(
        within(pool()).getByRole("button", { name: "Filters" }),
      ).toBeInTheDocument();
      expect(poolRequests(fetchMock)[0]).toEqual({
        sort: "basePrice",
        order: "desc",
        page: "1",
        pageSize: "25",
      });
    });

    it("sorts from the Sort by menu and marks the sorted column", async () => {
      mockApi();
      const user = userEvent.setup();
      const { router } = renderRoute("/teams/csk");
      await loaded();

      await user.click(
        within(pool()).getByRole("combobox", { name: "Sort by" }),
      );
      await user.click(
        await screen.findByRole("option", { name: "Age: youngest first" }),
      );

      await waitFor(() => {
        expect(router.state.location.search).toEqual({ sort: "age" });
      });
      await waitFor(() => {
        expect(shownNames()[0]).toBe("Kartik Sharma");
      });
      expect(
        within(pool()).getByRole("columnheader", { name: "Age" }),
      ).toHaveAttribute("aria-sort", "ascending");
    });

    it("keeps the base-price range from inverting", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk?minBase=100");
      await loaded(18);

      await user.click(
        within(pool()).getByRole("button", { name: "Filters (1)" }),
      );
      await user.click(await screen.findByRole("combobox", { name: "Up to" }));
      const options = (await screen.findAllByRole("option")).map(
        (option) => option.textContent,
      );
      expect(options).toEqual([
        "Any",
        "₹1.00 Cr",
        "₹1.25 Cr",
        "₹1.50 Cr",
        "₹2.00 Cr",
      ]);
    });
  });

  describe("rows", () => {
    it("has one control per row, reached in reading order", async () => {
      mockApi();
      renderRoute("/teams/csk");
      await loaded();

      const rows = within(pool()).getAllByRole("row").slice(1);
      for (const row of rows) {
        expect(within(row).getAllByRole("button")).toHaveLength(1);
      }
      expect(
        within(rows[0] ?? pool()).getByRole("rowheader"),
      ).toHaveTextContent("Cameron Green");
    });

    it("shows two columns with a summary line on tablet", async () => {
      setViewport("tablet");
      mockApi();
      renderRoute("/teams/csk");
      await loaded();

      expect(
        within(pool())
          .getAllByRole("columnheader")
          .map((header) => header.textContent),
      ).toEqual(["Player", "Base price"]);
      expect(within(pool()).getByText("Batter · AUS · 26")).toBeVisible();
    });

    it("shows a list and a filters sheet on mobile", async () => {
      setViewport("mobile");
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await loaded();

      expect(
        within(pool()).getByRole("list", { name: "Players" }),
      ).toBeVisible();
      await user.click(within(pool()).getByRole("button", { name: "Filters" }));

      const sheet = await screen.findByRole("dialog", { name: "Filters" });
      expect(
        within(sheet).getByRole("button", { name: "Show 30 players" }),
      ).toBeVisible();
    });
  });

  describe("detail dialog", () => {
    it("opens from a row with every field, and returns focus on close", async () => {
      mockApi();
      const user = userEvent.setup();
      renderRoute("/teams/csk");
      await loaded();

      const trigger = within(pool()).getByRole("button", {
        name: "Cameron Green, view details",
      });
      await user.click(trigger);

      const dialog = await screen.findByRole("dialog", {
        name: "Cameron Green",
      });
      const field = (label: string) =>
        within(dialog).getByText(label, { selector: "dt" }).nextElementSibling
          ?.textContent;
      expect(field("Age")).toBe("26 (on 16 Dec 2025)");
      expect(field("Nationality")).toBe("AustraliaOverseas");
      expect(field("Role")).toBe("Batter");
      expect(field("Batting")).toBe("Right-handed");
      expect(field("Bowling")).toBe("Right-arm fast");
      expect(field("Status")).toBe("Capped");
      expect(field("Base price")).toBe("₹2.00 Cr");

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      expect(trigger).toHaveFocus();
    });
  });
});
