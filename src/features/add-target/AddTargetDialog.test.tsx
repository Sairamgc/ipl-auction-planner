import { mockApi } from "@/test/apiFixtures";
import { urlOf } from "@/test/query";
import { renderRoute } from "@/test/render";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function pool() {
  return screen.getByRole("region", { name: "Player pool" });
}

/** The PUT /api/plans/csk bodies sent so far. */
function planSaves(fetchMock: ReturnType<typeof mockApi>) {
  return fetchMock.mock.calls
    .filter(([, init]) => init?.method === "PUT")
    .map(([input, init]) => ({
      path: urlOf(input).pathname,
      body: JSON.parse(
        typeof init?.body === "string" ? init.body : "{}",
      ) as unknown,
    }));
}

async function openAddFor(name: string) {
  const user = userEvent.setup();
  const add = await within(
    await screen.findByRole("region", { name: "Player pool" }),
  ).findByRole("button", { name: `Add ${name} to plan` });
  await user.click(add);
  const dialog = await screen.findByRole("dialog", { name: "Add to plan" });
  const price = within(dialog).getByRole("textbox", {
    name: "Expected price (lakh)",
  });
  return { user, add, dialog, price };
}

describe("AddTargetDialog", () => {
  it("pre-fills the base price with a formatted preview", async () => {
    mockApi();
    renderRoute("/teams/csk");
    const { dialog, price } = await openAddFor("Cameron Green");

    expect(within(dialog).getByText("Cameron Green")).toBeVisible();
    expect(within(dialog).getByText(/Base price/)).toHaveTextContent(
      "Base price ₹2.00 Cr",
    );
    expect(price).toHaveValue("200");
    expect(within(dialog).getByText("= ₹2.00 Cr")).toBeVisible();
  });

  it("adds the player at the chosen price, saves once, and returns focus to the row", async () => {
    const fetchMock = mockApi();
    renderRoute("/teams/csk");
    const { user, price } = await openAddFor("Cameron Green");

    await user.clear(price);
    await user.type(price, "240");
    expect(screen.getByText("= ₹2.40 Cr")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Add to plan" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(planSaves(fetchMock)).toEqual([
      {
        path: "/api/plans/csk",
        body: {
          id: "csk",
          franchiseId: "csk",
          targets: [
            { auctionEntryId: "2026-cameron-green", expectedPriceLakh: 240 },
          ],
        },
      },
    ]);
    // The row now shows it is in the plan, and focus is on its name
    const row = within(pool()).getByRole("row", { name: /Cameron Green/ });
    expect(within(row).getByText("In plan")).toBeVisible();
    expect(
      within(row).queryByRole("button", { name: /^Add/ }),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(row).getByRole("button", {
          name: "Cameron Green, view details",
        }),
      ).toHaveFocus();
    });
    expect(
      screen.getByText("Cameron Green added to plan at ₹2.40 Cr"),
    ).toBeInTheDocument();
  });

  it.each([
    ["", "Enter an expected price."],
    ["12.5", "Use whole lakh, e.g. 240 for ₹2.40 Cr."],
    ["abc", "Use whole lakh, e.g. 240 for ₹2.40 Cr."],
    ["150", "At least the base price, ₹2.00 Cr."],
  ])("blocks %j with %j and saves nothing", async (text, message) => {
    const fetchMock = mockApi();
    renderRoute("/teams/csk");
    const { user, dialog, price } = await openAddFor("Cameron Green");

    await user.clear(price);
    if (text) await user.type(price, text);
    await user.click(
      within(dialog).getByRole("button", { name: "Add to plan" }),
    );

    expect(await within(dialog).findByText(message)).toBeVisible();
    expect(price).toHaveAttribute("aria-invalid", "true");
    expect(price).toHaveAccessibleDescription(expect.stringContaining(message));
    expect(planSaves(fetchMock)).toEqual([]);
  });

  it("allows a price above the purse, with a note (D10)", async () => {
    mockApi();
    renderRoute("/teams/csk");
    const { user, dialog, price } = await openAddFor("Cameron Green");

    await user.clear(price);
    await user.type(price, "5000");

    expect(
      within(dialog).getByText(/^Above CSK's purse before the auction/),
    ).toHaveTextContent("Above CSK's purse before the auction (₹43.40 Cr).");
    expect(price).not.toHaveAttribute("aria-invalid");
  });

  it("steps the price with the arrow keys", async () => {
    mockApi();
    renderRoute("/teams/csk");
    const { user, price } = await openAddFor("Cameron Green");

    price.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(price).toHaveValue("210");
    await user.keyboard("{ArrowDown}");
    expect(price).toHaveValue("205");
  });

  it("returns focus to Add when cancelled", async () => {
    const fetchMock = mockApi();
    renderRoute("/teams/csk");
    const { user, add, dialog } = await openAddFor("Cameron Green");

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(add).toHaveFocus();
    });
    expect(planSaves(fetchMock)).toEqual([]);
  });
});
