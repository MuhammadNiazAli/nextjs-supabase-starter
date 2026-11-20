import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./Toast";
import { playToastSound } from "@/lib/sound";

vi.mock("@/lib/sound", () => ({
  playToastSound: vi.fn(),
}));

const mockedPlayToastSound = vi.mocked(playToastSound);

function TriggerButton({ type }: { type: "success" | "error" | "info" }) {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast("Hello", type)}>
      trigger
    </button>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ToastProvider sound wiring", () => {
  it("plays a sound when a success toast is shown", () => {
    render(
      <ToastProvider>
        <TriggerButton type="success" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "trigger" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Hello");
    expect(mockedPlayToastSound).toHaveBeenCalledTimes(1);
    expect(mockedPlayToastSound).toHaveBeenCalledWith("success");
  });

  it("plays a sound when an error toast is shown", () => {
    render(
      <ToastProvider>
        <TriggerButton type="error" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "trigger" }));

    expect(mockedPlayToastSound).toHaveBeenCalledTimes(1);
    expect(mockedPlayToastSound).toHaveBeenCalledWith("error");
  });

  it("plays no sound for an info toast", () => {
    render(
      <ToastProvider>
        <TriggerButton type="info" />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "trigger" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Hello");
    expect(mockedPlayToastSound).not.toHaveBeenCalled();
  });
});
