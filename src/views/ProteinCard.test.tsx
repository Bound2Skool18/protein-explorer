import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProteinCard } from "./ProteinCard";
import type { Protein } from "@/models/Protein";

const insulin: Protein = {
  accession: "P01308",
  id: "INS_HUMAN",
  name: "Insulin",
  organism: "Homo sapiens",
  genes: ["INS"],
  function: "Regulates glucose metabolism.",
};

describe("ProteinCard", () => {
  it("renders the protein's identifying info, organism, and genes", () => {
    render(<ProteinCard protein={insulin} isFavorite={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Insulin" })).toBeInTheDocument();
    expect(screen.getByText(/INS_HUMAN/)).toBeInTheDocument();
    expect(screen.getByText("Homo sapiens")).toBeInTheDocument();
    expect(screen.getByText("INS")).toBeInTheDocument();
  });

  it("calls onToggleFavorite with the protein when the save button is clicked", async () => {
    const onToggleFavorite = vi.fn();
    render(<ProteinCard protein={insulin} isFavorite={false} onToggleFavorite={onToggleFavorite} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onToggleFavorite).toHaveBeenCalledWith(insulin);
  });

  it("reflects the saved state via aria-pressed and label", () => {
    render(<ProteinCard protein={insulin} isFavorite={true} onToggleFavorite={vi.fn()} />);
    const button = screen.getByRole("button", { name: /saved/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("omits the genes and function sections when the protein has none", () => {
    render(
      <ProteinCard
        protein={{ ...insulin, genes: [], function: null }}
        isFavorite={false}
        onToggleFavorite={vi.fn()}
      />
    );
    expect(screen.queryByText("Genes")).not.toBeInTheDocument();
    expect(screen.queryByText(/regulates glucose/i)).not.toBeInTheDocument();
  });
});
