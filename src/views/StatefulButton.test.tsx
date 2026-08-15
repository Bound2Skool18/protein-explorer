import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatefulButton } from "./StatefulButton";

describe("StatefulButton", () => {
  it("cycles idle -> loading -> success on a resolving action", async () => {
    let resolveAction: () => void = () => {};
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        })
    );
    render(<StatefulButton onAction={onAction} />);

    const button = screen.getByRole("button", { name: "Search" });
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-busy", "true");

    resolveAction();
    await screen.findByText("Search"); // label reappears once back at idle/error rendering path
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("shows the error label after a rejecting action", async () => {
    const onAction = vi.fn(() => Promise.reject(new Error("boom")));
    render(<StatefulButton onAction={onAction} errorLabel="Retry" />);

    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText("Retry")).toBeInTheDocument();
  });

  it("ignores clicks while already loading (interruptible, not re-entrant)", async () => {
    let resolveAction: () => void = () => {};
    const onAction = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        })
    );
    render(<StatefulButton onAction={onAction} />);

    const button = screen.getByRole("button", { name: "Search" });
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);

    resolveAction();
  });

  it("does not fire onAction when disabled", async () => {
    const onAction = vi.fn(() => Promise.resolve());
    render(<StatefulButton onAction={onAction} disabled />);

    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(onAction).not.toHaveBeenCalled();
  });
});
