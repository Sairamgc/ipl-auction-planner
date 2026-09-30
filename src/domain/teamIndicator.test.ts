import { describe, expect, it } from "vitest";

import { teamIndicatorColor } from "./teamIndicator";

describe("teamIndicatorColor", () => {
  it("uses the primary colour when it stands out on the page", () => {
    // RCB red on white: 5.92:1
    expect(
      teamIndicatorColor({ primary: "#C90C13", secondary: "#E7C641" }),
    ).toBe("primary");
  });

  it("falls back to the secondary colour", () => {
    // CSK yellow on white is 1.52:1; CSK blue is 5.91:1
    expect(
      teamIndicatorColor({ primary: "#FFCB05", secondary: "#0066B3" }),
    ).toBe("secondary");
  });

  it("falls back to foreground when neither colour stands out", () => {
    expect(
      teamIndicatorColor({ primary: "#FFCB05", secondary: "#E7C641" }),
    ).toBe("foreground");
  });

  it("accepts exactly 3:1", () => {
    // #949494 on white is just over 3:1
    expect(
      teamIndicatorColor({ primary: "#949494", secondary: "#FFFFFF" }),
    ).toBe("primary");
  });

  it("measures against the given background", () => {
    expect(
      teamIndicatorColor(
        { primary: "#FFCB05", secondary: "#0066B3" },
        "#000000",
      ),
    ).toBe("primary");
  });
});
