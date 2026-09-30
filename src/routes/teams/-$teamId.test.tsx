import {
  type ApiResponses,
  defaultResponses,
  mockApi,
} from "@/test/apiFixtures";
import { renderRoute } from "@/test/render";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("/teams/$teamId (placeholder)", () => {
  it("shows the franchise and a way back", async () => {
    mockApi();
    renderRoute("/teams/csk");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Chennai Super Kings",
      }),
    ).toBeVisible();
    expect(screen.getByText("The workspace is coming next.")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Back to all teams" }),
    ).toHaveAttribute("href", "/");
  });

  it("shows not found for an unknown team", async () => {
    mockApi();
    renderRoute("/teams/xyz");

    expect(
      await screen.findByRole("heading", { name: "Page not found." }),
    ).toBeVisible();
  });

  it("offers a retry that reloads when franchises fail to load", async () => {
    const responses: ApiResponses = {
      ...defaultResponses(),
      "/api/franchises": 500,
    };
    mockApi(responses);
    renderRoute("/teams/csk");

    await screen.findByRole("heading", { name: "Couldn't load this team." });
    responses["/api/franchises"] = defaultResponses()["/api/franchises"];
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Chennai Super Kings",
      }),
    ).toBeVisible();
  });
});
