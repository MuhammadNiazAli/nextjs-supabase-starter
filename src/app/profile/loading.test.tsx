import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("Profile loading", () => {
  it("renders the loading spinner", () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector("svg.animate-spin");
    expect(spinner).not.toBeNull();
  });
});
