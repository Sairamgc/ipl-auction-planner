import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * Automated WCAG 2.2 AA checks (axe) on each screen and dialog (S35).
 * They catch regressions like a failing contrast; they don't replace the
 * manual keyboard and screen-reader checks.
 */
async function expectNoViolations(page: Page) {
  // Dialogs fade in; mid-animation colours would read as low contrast
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // Stretched name buttons are 20px tall, but their tap area is the whole
    // row (UI30); axe measures the button's own box
    .disableRules(["target-size"])
    // Dev-only TanStack devtools, not part of the app
    .exclude(".tsqd-parent-container")
    .exclude(".TanStackRouterDevtools")
    .analyze();
  expect(
    results.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    ),
  ).toEqual([]);
}

const pool = (page: Page) => page.getByRole("region", { name: "Player pool" });

/** RCB's plan reset before and after, as the plan tests do (S31). */
async function setRcbPlan(page: Page, targets: object[]) {
  const response = await page.request.put("/api/plans/rcb", {
    data: { id: "rcb", franchiseId: "rcb", targets },
  });
  expect(response.ok()).toBe(true);
}

test.describe("accessibility (axe)", () => {
  test.afterEach(async ({ page }) => {
    await setRcbPlan(page, []);
  });

  test("team picker", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Sunrisers Hyderabad" }),
    ).toBeVisible();
    await expectNoViolations(page);
  });

  test("workspace, with a warning showing", async ({ page, isMobile }) => {
    // Over purse, so the summary shows a warning and the ₹0 state
    await setRcbPlan(page, [
      { auctionEntryId: "2026-devon-conway", expectedPriceLakh: 2000 },
    ]);
    await page.goto("/teams/rcb");
    await expect(pool(page).getByText("98 players")).toBeVisible();
    await expectNoViolations(page);

    if (isMobile) {
      for (const tab of ["Plan", "Summary"]) {
        await page.getByRole("tab", { name: tab }).click();
        await expect(page.getByRole("tab", { name: tab })).toHaveAttribute(
          "aria-selected",
          "true",
        );
        await expectNoViolations(page);
      }
    }
  });

  test("tablet workspace with the summary strip open", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Tablet layout is a desktop-browser width");
    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto("/teams/rcb");
    await expect(pool(page).getByText("98 players")).toBeVisible();
    await page.getByRole("button", { name: /Show summary/ }).click();
    await expect(page.getByRole("region", { name: "Summary" })).toBeVisible();
    await expectNoViolations(page);
  });

  test("add dialog, detail dialog and filters", async ({ page }) => {
    await page.goto("/teams/rcb");
    await expect(pool(page).getByText("98 players")).toBeVisible();

    await pool(page)
      .getByRole("button", { name: "Add Cameron Green to plan" })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Add to plan" }),
    ).toBeVisible();
    await expectNoViolations(page);
    await page.keyboard.press("Escape");

    await pool(page)
      .getByRole("button", { name: "Cameron Green, view details" })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Cameron Green" }),
    ).toBeVisible();
    await expectNoViolations(page);
    await page.keyboard.press("Escape");

    await pool(page)
      .getByRole("button", { name: /^Filters/ })
      .click();
    await expect(page.getByRole("checkbox", { name: "Bowler" })).toBeVisible();
    await expectNoViolations(page);
  });
});
