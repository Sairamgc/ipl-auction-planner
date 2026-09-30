import { expect, test } from "@playwright/test";

function figure(page: import("@playwright/test").Page, label: string) {
  return page
    .locator("main header dt", { hasText: label })
    .locator("xpath=following-sibling::dd[1]");
}

test.describe("workspace", () => {
  test("picker → workspace → switch team → back to picker", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Chennai Super Kings" }).click();

    await expect(page).toHaveURL("/teams/csk");
    await expect(
      page.getByRole("heading", { level: 1, name: "Chennai Super Kings" }),
    ).toBeVisible();
    await expect(figure(page, "Purse")).toHaveText("₹43.40 Cr");
    await expect(page).toHaveTitle("Chennai Super Kings · IPL Auction Planner");

    // Switch with the keyboard
    await page.getByRole("button", { name: /^Switch team/ }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("menuitemradio", { name: /Mumbai Indians/ }).waitFor();
    // Type-ahead jumps to the only team starting with M
    await page.keyboard.press("m");
    await expect(
      page.getByRole("menuitemradio", { name: /Mumbai Indians/ }),
    ).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/teams/mi");
    const title = page.getByRole("heading", {
      level: 1,
      name: "Mumbai Indians",
    });
    await expect(title).toBeFocused();
    await expect(figure(page, "Purse")).toHaveText("₹2.75 Cr");
    await expect(page).toHaveTitle("Mumbai Indians · IPL Auction Planner");

    await page.getByRole("link", { name: "All teams" }).click();
    await expect(page).toHaveURL("/");
    await expect(page).toHaveTitle("Choose a team · IPL Auction Planner");
  });

  test("shows the layout for the screen size", async ({ page, isMobile }) => {
    await page.goto("/teams/csk");
    await expect(
      page.getByRole("heading", { level: 1, name: "Chennai Super Kings" }),
    ).toBeVisible();

    if (isMobile) {
      await expect(page.getByRole("tablist")).toBeVisible();
      await expect(
        page.getByRole("complementary", { name: "Plan summary" }),
      ).toBeVisible();
    } else {
      for (const name of ["Player pool", "My plan", "Summary"]) {
        await expect(page.getByRole("region", { name })).toBeVisible();
      }
      await expect(page.getByRole("tablist")).toHaveCount(0);
    }
  });

  test("keeps the mobile tab in the URL across a reload", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Tabs exist on mobile only");
    await page.goto("/teams/csk");

    await page.getByRole("tab", { name: "Plan" }).click();
    await expect(page).toHaveURL("/teams/csk?tab=plan");
    await expect(page.getByRole("region", { name: "My plan" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("tab", { name: "Plan" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

test.describe("workspace scrolling", () => {
  /** Adds rows so the pool is sure to overflow its panel at any size. */
  async function fillPool(page: import("@playwright/test").Page) {
    await page.evaluate(() => {
      const panel = document.querySelector(
        'section[aria-labelledby="pool-heading"]',
      );
      for (let i = 0; i < 60; i++) {
        panel?.insertAdjacentHTML(
          "beforeend",
          `<p data-test-row style="padding: 4px 16px">Row ${String(i)}</p>`,
        );
      }
    });
  }

  test("panels can be scrolled with the keyboard (UI20)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Panels scroll on their own on tablet and desktop");
    await page.goto("/teams/csk");
    await page.locator("header").getByText("Before the auction").waitFor();
    await fillPool(page);

    await page.getByRole("button", { name: /^Switch team/ }).focus();
    await page.keyboard.press("Tab");
    const pool = page.getByRole("region", { name: "Player pool" });
    await expect(pool).toBeFocused();

    await page.keyboard.press("PageDown");
    await expect
      .poll(() => pool.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
  });

  test("the mini summary never covers content (UI21)", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "The mini summary exists on mobile only");
    await page.goto("/teams/csk");
    await page.locator("header").getByText("Before the auction").waitFor();
    await fillPool(page);
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });

    const panel = await page
      .getByRole("region", { name: "Player pool" })
      .boundingBox();
    const bar = await page
      .getByRole("complementary", { name: "Plan summary" })
      .boundingBox();
    expect(panel && bar).toBeTruthy();
    if (!panel || !bar) return;
    expect(panel.y + panel.height).toBeLessThanOrEqual(bar.y);

    // The sticky tabs cover what scrolls beneath them (no overhang)
    const tabs = await page.getByRole("tablist").boundingBox();
    const tabButtons = await page.getByRole("tab").first().boundingBox();
    if (!tabs || !tabButtons) throw new Error("tabs not visible");
    expect(tabButtons.y + tabButtons.height).toBeLessThanOrEqual(
      tabs.y + tabs.height,
    );
  });
});
