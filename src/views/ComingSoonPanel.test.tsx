import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoonPanel } from "./ComingSoonPanel";

describe("ComingSoonPanel", () => {
  it("renders the given title and description", () => {
    render(
      <ComingSoonPanel icon="dataset" title="Datasets" description="Bulk export. Coming soon." />
    );
    expect(screen.getByRole("heading", { name: "Datasets" })).toBeInTheDocument();
    expect(screen.getByText("Bulk export. Coming soon.")).toBeInTheDocument();
  });
});
