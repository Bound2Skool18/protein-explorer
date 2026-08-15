import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("calls onSearch with the typed query when the button is clicked", async () => {
    const onSearch = vi.fn(() => Promise.resolve());
    render(<SearchBar onSearch={onSearch} />);

    await userEvent.type(screen.getByLabelText("Search proteins"), "insulin");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("insulin");
  });

  it("submits via Enter in the input, not just a button click", async () => {
    const onSearch = vi.fn(() => Promise.resolve());
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText("Search proteins");
    await userEvent.type(input, "hemoglobin{Enter}");

    expect(onSearch).toHaveBeenCalledWith("hemoglobin");
  });

  it("pre-fills the query from initialQuery", () => {
    render(<SearchBar onSearch={vi.fn()} initialQuery="BRCA1" />);
    expect(screen.getByLabelText("Search proteins")).toHaveValue("BRCA1");
  });
});
