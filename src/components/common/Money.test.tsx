import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Money } from "./Money";

describe("Money", () => {
  it.each([
    [4340, "₹43.40 Cr"],
    [75, "₹75 L"],
    [0, "₹0 L"],
  ])("shows %i lakh as %s", (lakh, text) => {
    const { container } = render(<Money lakh={lakh} />);
    expect(container.textContent).toBe(text);
    expect(container.querySelector("data")).toHaveAttribute(
      "value",
      String(lakh),
    );
  });

  it("shows negatives with a minus sign, read as 'minus' (D14)", () => {
    render(<Money lakh={-120} />);
    expect(screen.getByText("−₹1.20 Cr")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByText("minus ₹1.20 Cr")).toHaveClass("sr-only");
  });
});
