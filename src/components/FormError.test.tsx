import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormError from "./FormError";

describe("FormError", () => {
  it("renders the message inside an alert region when given one", () => {
    render(<FormError message="Email is required." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Email is required.");
  });

  it("is open (grows to the message) when a message is present", () => {
    const { container } = render(<FormError message="Email is required." />);

    expect(container.firstChild).toHaveClass("form-error--open");
  });

  it("is collapsed (zero height) when there is no message", () => {
    const { container } = render(<FormError />);

    expect(container.firstChild).toHaveClass("form-error");
    expect(container.firstChild).not.toHaveClass("form-error--open");
  });

  it("keeps an empty alert region when there is no message, so the region exists before the error appears", () => {
    render(<FormError />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("");
  });

  it("collapses again when the message is cleared", () => {
    const { container, rerender } = render(
      <FormError message="Email is required." />,
    );
    expect(container.firstChild).toHaveClass("form-error--open");

    rerender(<FormError />);

    expect(container.firstChild).not.toHaveClass("form-error--open");
    expect(screen.getByRole("alert")).toHaveTextContent("");
  });

  it("treats an empty string the same as no message", () => {
    const { container } = render(<FormError message="" />);

    expect(container.firstChild).not.toHaveClass("form-error--open");
  });
});
