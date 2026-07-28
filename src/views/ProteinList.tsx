import type { Protein } from "../models/Protein";
import { ProteinCard } from "./ProteinCard";

type ProteinListProps = {
  proteins: Protein[];
  isFavorite: (accession: string) => boolean;
  onToggleFavorite: (protein: Protein) => void;
};

export function ProteinList({ proteins, isFavorite, onToggleFavorite }: ProteinListProps) {
  if (proteins.length === 0) {
    return <p className="text-sm text-gray-600">No results yet — try a search above.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
