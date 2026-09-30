import { expect, type Page, test } from "@playwright/test";

const pool = (page: Page) => page.getByRole("region", { name: "Player pool" });
const plan = (page: Page) => page.getByRole("region", { name: "My plan" });
const summary = (page: Page) => page.getByRole("region", { name: "Summary" });
const summaryBar = (page: Page) =>
  page.getByRole("complementary", { name: "Plan summary" }).getByRole("button");

/** Summary tests save to the shared mock server: start and end with RCB empty (S31). */
async function resetRcbPlan(page: Page) {
  const response = await page.request.put("/api/plans/rcb", {
    data: { id: "rcb", franchiseId: "rcb", targets: [] },
  });
  expect(response.ok()).toBe(true);
}

/** Adds a player at their base price, found by search. */
async function addAtBase(page: Page, name: string) {
  const search = pool(page).getByRole("searchbox", { name: "Search players" });
  await search.fill(name);
  await pool(page)
    .getByRole("button", { name: `Add ${name} to plan` })
    .click();
  const dialog = page.getByRole("dialog", { name: "Add to plan" });
  await dialog.getByRole("button", { name: "Add to plan" }).click();
  await expect(dialog).toBeHidden();
}

test.describe("summary", () => {
  test.beforeEach(async ({ page }) => {
    await resetRcbPlan(page);
  });
  test.afterEach(async ({ page }) => {
    await resetRcbPlan(page);
  });

  test("a warning appears when a limit is passed and clears when fixed", async ({
    page,
    isMobile,
  }) => {
    // RCB: 17 retained, 6 overseas; the cap is 8
    await page.goto("/teams/rcb");
    const warning = summary(page).getByText("Too many overseas players");

    for (const name of ["Jordan Cox", "Jonny Bairstow", "Rahmanullah Gurbaz"]) {
      await addAtBase(page, name);
    }

    if (isMobile) {
      await expect(summaryBar(page)).toHaveAccessibleName(/, 1 warning\./);
      await summaryBar(page).click();
      await expect(
        page.getByRole("heading", { level: 2, name: "Summary" }),
      ).toBeFocused();
    }
    await expect(warning).toBeVisible();
    await expect(summary(page).getByText("9 of 8")).toBeVisible();

    if (isMobile) await page.getByRole("tab", { name: "Plan" }).click();
    await plan(page)
      .getByRole("button", { name: "Remove Rahmanullah Gurbaz from plan" })
      .click();

    if (isMobile) {
      await expect(summaryBar(page)).toHaveAccessibleName(/, no warnings\./);
      await page.getByRole("tab", { name: "Summary" }).click();
    }
    await expect(warning).toBeHidden();
    await expect(summary(page).getByText("Within all limits")).toBeVisible();
  });
});
