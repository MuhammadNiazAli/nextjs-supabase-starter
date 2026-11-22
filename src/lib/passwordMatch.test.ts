import { describe, expect, it } from "vitest";
import { getPasswordMatchState, matchStateClassName } from "./passwordMatch";

describe("getPasswordMatchState", () => {
  it("stays neutral until the user types a confirmation", () => {
    expect(getPasswordMatchState("Password123", "")).toBe("empty");
  });

  it("reports a mismatch while the two values differ", () => {
    expect(getPasswordMatchState("Password123", "Pass")).toBe("mismatch");
  });

  it("reports a match once both values are identical", () => {
    expect(getPasswordMatchState("Password123", "Password123")).toBe("match");
  });

  it("treats a case difference as a mismatch", () => {
    expect(getPasswordMatchState("Password123", "password123")).toBe("mismatch");
  });
});

describe("matchStateClassName", () => {
  it("adds the green border class on a match", () => {
    expect(matchStateClassName("match")).toBe("confirm-password-input is-match");
  });

  it("adds the red border class on a mismatch", () => {
    expect(matchStateClassName("mismatch")).toBe("confirm-password-input is-mismatch");
  });

  it("adds no colour class while the field is empty", () => {
    expect(matchStateClassName("empty")).toBe("confirm-password-input");
  });
});
