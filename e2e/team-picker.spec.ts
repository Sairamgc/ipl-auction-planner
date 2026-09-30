import { expect, type Locator, test } from "@playwright/test";

/** The figure next to a label in a card's definition list. */
function figure(card: Locator, label: string) {
  return card
    .locator("dt", { hasText: label })
    .locator("xpath=following-sibling::dd[1]");
}

test.describe("team picker", () => {
  test("shows each franchise from the mock server", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Choose a team to plan for",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("IPL 2026 Player Auction · 16 Dec 2025"),
    ).toBeVisible();

    const cards = page
      .getByRole("list", { name: "Teams" })
      .getByRole("listitem");
    await expect(cards).toHaveCount(10);
    // Alphabetical by name (UI1); "Rajasthan" sorts before "Royal"
    await expect(cards.getByRole("link")).toHaveText([
      "Chennai Super Kings",
      "Delhi Capitals",
      "Gujarat Titans",
      "Kolkata Knight Riders",
      "Lucknow Super Giants",
      "Mumbai Indians",
      "Punjab Kings",
      "Rajasthan Royals",
      "Royal Challengers Bengaluru",
      "Sunrisers Hyderabad",
    ]);

    const csk = cards.filter({ hasText: "Chennai Super Kings" });
    await expect(figure(csk, "Purse")).toHaveText("₹43.40 Cr");
    await expect(figure(csk, "Open slots")).toHaveText("9");
    await expect(figure(csk, "Overseas slots")).toHaveText("4");
    await expect(csk.getByText("Not started")).toBeVisible();

    const rcb = cards.filter({ hasText: "Royal Challengers Bengaluru" });
    await expect(figure(rcb, "Purse")).toHaveText("₹16.40 Cr");
    await expect(figure(rcb, "Open slots")).toHaveText("8");
    await expect(figure(rcb, "Overseas slots")).toHaveText("2");
    await expect(rcb.getByText("Not started")).toBeVisible();
  });

  test("opens a workspace by clicking anywhere on a card", async ({ page }) => {
    await page.goto("/");

    // Click where the purse figure is, not the name: the team link stretches
    // over the whole card, so a real click there must still navigate
    const purse = page
      .getByRole("listitem")
      .filter({ hasText: "Chennai Super Kings" })
      .getByText("₹43.40 Cr");
    const box = await purse.boundingBox();
    if (!box) throw new Error("purse figure is not visible");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    await expect(page).toHaveURL("/teams/csk");
    await expect(
      page.getByRole("heading", { level: 1, name: "Chennai Super Kings" }),
    ).toBeVisible();
  });

  test("opens a workspace with the keyboard", async ({ page, browserName }) => {
    // Safari's Tab skips links unless "Press Tab to highlight each item" is
    // on; Option+Tab always does (S33)
    const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Delhi Capitals" }),
    ).toBeVisible();

    // Header link, then CSK, then DC (cards are alphabetical)
    await page.keyboard.press(tab);
    await page.keyboard.press(tab);
    await page.keyboard.press(tab);
    await expect(
      page.getByRole("link", { name: "Delhi Capitals" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL("/teams/dc");
    await page.getByRole("link", { name: "All teams" }).click();
    await expect(page).toHaveURL("/");
  });
});
