import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { initialsOf } from "@/lib/initials";

import { InitialsAvatar } from "./InitialsAvatar";

describe("initialsOf", () => {
  it.each([
    ["Cameron Green", "CG"],
    ["MS Dhoni", "MD"],
    ["Jake Fraser-McGurk", "JF"],
    ["Rahmanullah Gurbaz", "RG"],
    ["Madonna", "M"],
    ["  ", ""],
  ])("%j → %j", (name, initials) => {
    expect(initialsOf(name)).toBe(initials);
  });
});

describe("InitialsAvatar", () => {
  it("is decorative", () => {
    const { container } = render(<InitialsAvatar name="Cameron Green" />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.textContent).toBe("CG");
  });
});
