import { expect, type Page, test } from "@playwright/test";

const pool = (page: Page) => page.getByRole("region", { name: "Player pool" });

function playerButtons(page: Page) {
  return pool(page).getByRole("button", { name: /, view details$/ });
}

test.describe("pool", () => {
  test("filter → URL → reload → detail dialog → focus returns", async ({
    page,
  }) => {
    await page.goto("/teams/csk");
    await expect(pool(page).getByText("98 players")).toBeVisible();

    // Filter: Indian wicketkeepers
    await pool(page)
      .getByRole("button", { name: /^Filters/ })
      .click();
    await page.getByRole("checkbox", { name: "Wicketkeeper" }).click();
    await page.getByRole("radio", { name: "Indian" }).click();
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL("/teams/csk?role=wicketkeeper&overseas=false");
    // All ₹30 L base, so the default sort falls back to name (N11)
    const indianKeepers = [
      "Kartik Sharma",
      "Mukul Choudhary",
      "Ravi Singh",
      "Salil Arora",
      "Tejasvi Singh Dahiya",
    ];
    await expect(
      pool(page).getByText("5 players", { exact: true }),
    ).toBeVisible();
    await expect(playerButtons(page)).toHaveText(indianKeepers);

    // Reload keeps the filters and results
    await page.reload();
    await expect(page).toHaveURL("/teams/csk?role=wicketkeeper&overseas=false");
    await expect(playerButtons(page)).toHaveText(indianKeepers);
    await expect(
      pool(page).getByRole("button", {
        name: "Remove filter: Role: Wicketkeeper",
      }),
    ).toBeVisible();

    // Detail dialog, opened with the keyboard
    const trigger = pool(page).getByRole("button", {
      name: "Kartik Sharma, view details",
    });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Kartik Sharma" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("19 (on 16 Dec 2025)")).toBeVisible();
    await expect(dialog.getByText("Uncapped")).toBeVisible();
    await expect(dialog.getByText("₹30 L")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("search narrows the pool after typing stops", async ({ page }) => {
    await page.goto("/teams/csk");
    await expect(pool(page).getByText("98 players")).toBeVisible();

    await pool(page)
      .getByRole("searchbox", { name: "Search players" })
      .fill("green");
    await expect(page).toHaveURL("/teams/csk?search=green");
    await expect(playerButtons(page)).toHaveText(["Cameron Green"]);
  });

  test.describe("more than one page (network mocked, S29)", () => {
    /**
     * Turns off auto-load so a test can use the button: in WebKit, scrolling
     * the button into view to click it would auto-load first (S33).
     */
    async function withoutAutoLoad(page: Page) {
      await page.addInitScript(() => {
        window.IntersectionObserver = class {
          observe() {}
          unobserve() {}
          disconnect() {}
          takeRecords() {
            return [];
          }
        } as unknown as typeof IntersectionObserver;
      });
    }

    /** Serves a 40-player pool from the real first page's shape. */
    async function mockPages(page: Page, { failPageTwo = false } = {}) {
      // The first try plus two automatic retries (N29) must all fail
      let pageTwoFailures = failPageTwo ? 3 : 0;
      await page.route("**/api/pool?**", async (route) => {
        const url = new URL(route.request().url());
        const number = Number(url.searchParams.get("page") ?? "1");
        if (number === 2 && pageTwoFailures > 0) {
          pageTwoFailures -= 1;
          await route.fulfill({
            status: 500,
            json: { error: "Simulated failure" },
          });
          return;
        }
        const response = await route.fetch({
          url: url.href.replace(/page=\d+/, "page=1"),
        });
        const real = (await response.json()) as {
          items: { id: string; player: { id: string; name: string } }[];
        };
        const template = real.items[0];
        if (!template) throw new Error("empty pool");
        const start = (number - 1) * 25;
        const count = Math.min(25, 40 - start);
        const items = Array.from({ length: count }, (_, index) => {
          const n = String(start + index + 1).padStart(2, "0");
          return {
            ...template,
            id: `2026-test-player-${n}`,
            player: {
              ...template.player,
              id: `test-player-${n}`,
              name: `Test Player ${n}`,
            },
          };
        });
        await route.fulfill({
          json: { items, total: 40, page: number, pageSize: 25 },
        });
      });
    }

    test("loads the next page with the button and focuses the first new row", async ({
      page,
    }) => {
      await withoutAutoLoad(page);
      await mockPages(page);
      await page.goto("/teams/csk");
      await expect(pool(page).getByText("40 players")).toBeVisible();
      await expect(playerButtons(page)).toHaveCount(25);

      await pool(page).getByRole("button", { name: "Load more" }).click();
      await expect(playerButtons(page)).toHaveCount(40);
      await expect(
        pool(page).getByRole("button", {
          name: "Test Player 26, view details",
        }),
      ).toBeFocused();
    });

    test("keeps loaded rows when the next page fails, then retries", async ({
      page,
    }) => {
      await withoutAutoLoad(page);
      await mockPages(page, { failPageTwo: true });
      await page.goto("/teams/csk");
      await expect(playerButtons(page)).toHaveCount(25);

      await pool(page).getByRole("button", { name: "Load more" }).click();
      const alert = pool(page).getByRole("alert");
      // Shown after the automatic retries (about 3 s of backoff)
      await expect(alert).toContainText("Couldn't load more players.", {
        timeout: 10_000,
      });
      await expect(playerButtons(page)).toHaveCount(25);

      await alert.getByRole("button", { name: "Try again" }).click();
      await expect(playerButtons(page)).toHaveCount(40);
    });

    test("auto-loads when scrolled to the end", async ({ page, isMobile }) => {
      await mockPages(page);
      await page.goto("/teams/csk");
      await expect(playerButtons(page)).toHaveCount(25);

      if (isMobile) {
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        });
      } else {
        await pool(page).evaluate((element) => {
          element.scrollTo(0, element.scrollHeight);
        });
      }
      await expect(playerButtons(page)).toHaveCount(40);
    });
  });
});
