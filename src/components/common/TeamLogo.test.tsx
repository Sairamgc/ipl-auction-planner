import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamLogo } from "./TeamLogo";

describe("TeamLogo", () => {
  it("shows the initials badge without a logo path", () => {
    const { container } = render(<TeamLogo shortName="CSK" />);
    expect(screen.getByText("CSK")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows the logo image when a path is set", () => {
    const { container } = render(
      <TeamLogo shortName="CSK" logoPath="/logos/csk.svg" />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/logos/csk.svg",
    );
    expect(screen.queryByText("CSK")).not.toBeInTheDocument();
  });

  it("falls back to the initials badge when the image fails to load", () => {
    const { container } = render(
      <TeamLogo shortName="CSK" logoPath="/logos/missing.svg" />,
    );
    const image = container.querySelector("img");
    if (!image) throw new Error("expected an image");
    fireEvent.error(image);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("CSK")).toBeInTheDocument();
  });

  it("tries again when the logo path changes", () => {
    const { container, rerender } = render(
      <TeamLogo shortName="CSK" logoPath="/logos/missing.svg" />,
    );
    const image = container.querySelector("img");
    if (!image) throw new Error("expected an image");
    fireEvent.error(image);

    rerender(<TeamLogo shortName="CSK" logoPath="/logos/csk.svg" />);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/logos/csk.svg",
    );
  });

  it("is hidden from screen readers, since the name is always beside it", () => {
    const { container } = render(<TeamLogo shortName="CSK" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
