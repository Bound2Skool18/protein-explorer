import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProteinResultCard, ToolError, ToolPending, ToolRunning } from "./ProteinToolParts";
import type { Protein } from "@/models/Protein";

const insulin: Protein = {
  accession: "P01308",
  id: "INS_HUMAN",
  name: "Insulin",
  organism: "Homo sapiens",
  genes: ["INS"],
  function: "Regulates glucose metabolism.",
};

describe("ProteinToolParts", () => {
  it("ToolPending announces the lookup is being prepared", () => {
    render(<ToolPending />);
    expect(screen.getByText("Preparing protein lookup…")).toBeInTheDocument();
  });

  it("ToolRunning shows the query being looked up", () => {
    render(<ToolRunning query="hemoglobin" />);
    expect(screen.getByText("hemoglobin")).toBeInTheDocument();
  });

  it("ProteinResultCard renders the protein's name, ids, organism, and genes", () => {
    render(<ProteinResultCard protein={insulin} />);
    expect(screen.getByRole("heading", { name: "Insulin" })).toBeInTheDocument();
    expect(screen.getByText(/INS_HUMAN/)).toBeInTheDocument();
    expect(screen.getByText(/P01308/)).toBeInTheDocument();
    expect(screen.getByText("Homo sapiens")).toBeInTheDocument();
    expect(screen.getByText("INS")).toBeInTheDocument();
    expect(screen.getByText(/regulates glucose metabolism/i)).toBeInTheDocument();
  });

  it("ProteinResultCard omits the function paragraph when there is none", () => {
    render(<ProteinResultCard protein={{ ...insulin, function: null }} />);
    expect(screen.queryByText(/regulates glucose metabolism/i)).not.toBeInTheDocument();
  });

  it("ToolError shows the server-provided message when given one", () => {
    render(<ToolError message='No UniProt entry found for "xyz".' />);
    expect(screen.getByText('No UniProt entry found for "xyz".')).toBeInTheDocument();
  });

  it("ToolError falls back to a generic message when none is given", () => {
    render(<ToolError />);
    expect(screen.getByText(/couldn't reach uniprot/i)).toBeInTheDocument();
  });
});
