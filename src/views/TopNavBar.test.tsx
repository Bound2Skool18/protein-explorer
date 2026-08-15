import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { TopNavBar } from "./TopNavBar";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
const mockedUsePathname = vi.mocked(usePathname);

describe("TopNavBar", () => {
  it("shows a login link when signed out", () => {
    mockedUsePathname.mockReturnValue("/search");
    render(<TopNavBar userEmail={null} onMenuClick={vi.fn()} />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  it("shows the user's initial instead of a login link when signed in", () => {
    mockedUsePathname.mockReturnValue("/search");
    render(<TopNavBar userEmail="jane@example.com" onMenuClick={vi.fn()} />);
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
  });

  it("calls onMenuClick when the mobile menu button is pressed", async () => {
    mockedUsePathname.mockReturnValue("/search");
    const onMenuClick = vi.fn();
    render(<TopNavBar userEmail={null} onMenuClick={onMenuClick} />);

    await userEvent.click(screen.getByRole("button", { name: "menu" }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
