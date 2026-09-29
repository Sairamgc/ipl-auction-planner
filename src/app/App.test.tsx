import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the team picker route at /", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "IPL Auction Planner" }),
    ).toBeInTheDocument();
  });
});
