import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthPanel } from "./AuthPanel";

describe("AuthPanel", () => {
  it("submits the entered email and password to onLogin", async () => {
    const onLogin = vi.fn();
    render(<AuthPanel error={null} onLogin={onLogin} onRegister={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Email"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "hunter22");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(onLogin).toHaveBeenCalledWith("jane@example.com", "hunter22");
  });

  it("does not call onLogin when the required email field is left empty", async () => {
    const onLogin = vi.fn();
    render(<AuthPanel error={null} onLogin={onLogin} onRegister={vi.fn()} />);

    await userEvent.type(screen.getByLabelText("Password"), "hunter22");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(onLogin).not.toHaveBeenCalled();
  });

  it("enforces a 6-character minimum on the password field", () => {
    render(<AuthPanel error={null} onLogin={vi.fn()} onRegister={vi.fn()} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "6");
  });

  it("calls onRegister with the current field values, bypassing form validation", async () => {
    const onRegister = vi.fn();
    render(<AuthPanel error={null} onLogin={vi.fn()} onRegister={onRegister} />);

    await userEvent.type(screen.getByLabelText("Email"), "new@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "abcdef");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(onRegister).toHaveBeenCalledWith("new@example.com", "abcdef");
  });

  it("surfaces an auth error via role=alert", () => {
    render(<AuthPanel error="Invalid credentials" onLogin={vi.fn()} onRegister={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
