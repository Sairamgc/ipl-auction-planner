import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("moves focus to its title and offers a retry", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Couldn't load teams."
        description="Check your connection and try again."
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Couldn't load teams." }),
    ).toHaveFocus();
    expect(
      screen.getByText("Check your connection and try again."),
    ).toBeVisible();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not also announce itself as a live alert", () => {
    render(<ErrorState title="Oops" onRetry={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("can announce as an alert without moving focus (UI32)", () => {
    render(
      <ErrorState
        title="Couldn't load players."
        announce="alert"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load players.",
    );
    expect(screen.getByRole("heading")).not.toHaveFocus();
  });
});
