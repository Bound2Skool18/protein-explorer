import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
const mockedUsePathname = vi.mocked(usePathname);

describe("Sidebar", () => {
  it("marks the current route's link as active", () => {
    mockedUsePathname.mockReturnValue("/workspace");
    render(<Sidebar open={false} onClose={vi.fn()} userEmail={null} onLogout={vi.fn()} />);

    expect(screen.getByRole("link", { name: /workspace/i })).toHaveClass("text-secondary");
    expect(screen.getByRole("link", { name: /search/i })).not.toHaveClass("text-secondary");
  });

  it("shows a Log In link when signed out", () => {
    mockedUsePathname.mockReturnValue("/search");
    render(<Sidebar open={false} onClose={vi.fn()} userEmail={null} onLogout={vi.fn()} />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  it("shows a Log Out button that calls onLogout when signed in", async () => {
    mockedUsePathname.mockReturnValue("/search");
    const onLogout = vi.fn();
    render(<Sidebar open={false} onClose={vi.fn()} userEmail="jane@example.com" onLogout={onLogout} />);

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when a nav link is clicked (mobile drawer dismissal)", async () => {
    mockedUsePathname.mockReturnValue("/search");
    const onClose = vi.fn();
    render(<Sidebar open onClose={onClose} userEmail={null} onLogout={vi.fn()} />);

    await userEvent.click(screen.getByRole("link", { name: /assistant/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
