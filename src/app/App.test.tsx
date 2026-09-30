import { mockApi } from "@/test/apiFixtures";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("opens on the team picker, inside the app shell", async () => {
    mockApi();
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Choose a team to plan for",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "IPL Auction Planner" }),
    ).toHaveAttribute("href", "/");
  });
});
