import type { Protein } from "../models/Protein";
import { ProteinCard } from "./ProteinCard";

type ProteinListProps = {
  proteins: Protein[];
  isFavorite: (accession: string) => boolean;
  onToggleFavorite: (protein: Protein) => void;
};

export function ProteinList({ proteins, isFavorite, onToggleFavorite }: ProteinListProps) {
  if (proteins.length === 0) {
    return <p className="text-sm text-on-surface-variant italic">No results yet — try a search above.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {proteins.map((protein) => (
        <ProteinCard
          key={protein.accession}
          protein={protein}
          isFavorite={isFavorite(protein.accession)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  );
}
