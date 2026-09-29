import { expect, test } from "@playwright/test";

test("opens on the team picker", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "IPL Auction Planner" }),
  ).toBeVisible();
});

test("opens a team workspace by URL", async ({ page }) => {
  await page.goto("/teams/csk");

  await expect(
    page.getByRole("heading", { name: "Workspace: csk" }),
  ).toBeVisible();
});

test("shows not found for unknown routes", async ({ page }) => {
  await page.goto("/no-such-page");

  await expect(page.getByText("Page not found.")).toBeVisible();
});

test("reaches the mock server through the /api proxy", async ({ request }) => {
  const response = await request.get("/api/franchises");

  expect(response.ok()).toBe(true);
});
