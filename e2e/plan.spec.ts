import { expect, type Page, test } from "@playwright/test";

const pool = (page: Page) => page.getByRole("region", { name: "Player pool" });
const plan = (page: Page) => page.getByRole("region", { name: "My plan" });

/** On mobile the plan and pool are tabs; elsewhere both are on screen. */
async function showPlan(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("tab", { name: "Plan" }).click();
}
async function showPool(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("tab", { name: "Pool" }).click();
}

/** Plan tests save to the shared mock server: start and end with RCB empty. */
async function resetRcbPlan(page: Page) {
  const response = await page.request.put("/api/plans/rcb", {
    data: { id: "rcb", franchiseId: "rcb", targets: [] },
  });
  expect(response.ok()).toBe(true);
}

test.describe("plan", () => {
  test.beforeEach(async ({ page }) => {
    await resetRcbPlan(page);
  });
  test.afterEach(async ({ page }) => {
    await resetRcbPlan(page);
  });

  test("add → edit price → remove, each kept after a reload", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/teams/rcb");

    // Add Cameron Green at 240 L
    await pool(page)
      .getByRole("button", { name: "Add Cameron Green to plan" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Add to plan" });
    const price = dialog.getByRole("textbox", {
      name: "Expected price (lakh)",
    });
    await expect(price).toHaveValue("200");
    await price.fill("240");
    await dialog.getByRole("button", { name: "Add to plan" }).click();
    await expect(dialog).toBeHidden();
    await expect(
      pool(page)
        .getByRole("row", { name: /Cameron Green/ })
        .or(
          pool(page).getByRole("listitem").filter({ hasText: "Cameron Green" }),
        ),
    ).toContainText("In plan");

    await page.reload();
    await showPlan(page, isMobile);
    const input = plan(page).getByRole("textbox", {
      name: "Expected price for Cameron Green, in lakh",
    });
    await expect(input).toHaveValue("240");

    // Edit the price inline
    await input.fill("275");
    await input.press("Enter");
    await expect(plan(page).getByText("Saved")).toBeVisible();
    await page.reload();
    await showPlan(page, isMobile);
    await expect(
      plan(page).getByRole("textbox", { name: /Cameron Green/ }),
    ).toHaveValue("275");

    // Remove it
    await plan(page)
      .getByRole("button", { name: "Remove Cameron Green from plan" })
      .click();
    await expect(
      plan(page).getByRole("button", { name: "Undo removing Cameron Green" }),
    ).toBeFocused();
    await expect(plan(page).getByText("Saved")).toBeVisible();
    await page.reload();
    await showPlan(page, isMobile);
    await expect(plan(page).getByText(/^No targets yet/)).toBeVisible();
    await showPool(page, isMobile);
    await expect(
      pool(page).getByRole("button", { name: "Add Cameron Green to plan" }),
    ).toBeVisible();
  });

  test("a failed save rolls back, explains it, and Try again succeeds", async ({
    page,
    isMobile,
  }) => {
    let failNextSave = false;
    await page.route("**/api/plans/rcb", async (route) => {
      if (route.request().method() === "PUT" && failNextSave) {
        failNextSave = false;
        await route.fulfill({
          status: 500,
          json: { error: "Simulated failure" },
        });
        return;
      }
      await route.continue();
    });
    await page.goto("/teams/rcb");

    await pool(page)
      .getByRole("button", { name: "Add Jacob Duffy to plan" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add to plan" })
      .click();
    await showPlan(page, isMobile);
    const input = plan(page).getByRole("textbox", { name: /Jacob Duffy/ });
    await expect(input).toHaveValue("200");
    await expect(plan(page).getByText("Saved")).toBeVisible();

    // This save fails: the price goes back to what the server has
    failNextSave = true;
    await input.fill("260");
    await input.press("Enter");
    const alert = plan(page).getByRole("alert");
    await expect(alert).toContainText("Couldn't save your last change.");
    await expect(input).toHaveValue("200");

    // Try again resends the plan that failed
    await alert.getByRole("button", { name: "Try again" }).click();
    await expect(alert).toBeHidden();
    await expect(input).toHaveValue("260");
    await expect(plan(page).getByText("Saved")).toBeVisible();
    await page.reload();
    await showPlan(page, isMobile);
    await expect(
      plan(page).getByRole("textbox", { name: /Jacob Duffy/ }),
    ).toHaveValue("260");
  });
});
