import type { Protein } from "../models/Protein";

type ProteinCardProps = {
  protein: Protein;
  isFavorite: boolean;
  onToggleFavorite: (protein: Protein) => void;
};

export function ProteinCard({ protein, isFavorite, onToggleFavorite }: ProteinCardProps) {
  return (
    <li className="space-y-2 rounded border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium">{protein.name}</h3>
          <p className="text-sm text-gray-600">
            {protein.id} · {protein.accession}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(protein)}
          className="shrink-0 rounded border px-2 py-1 text-sm"
        >
          {isFavorite ? "★ Saved" : "☆ Save"}
        </button>
      </div>

      <p className="text-sm">
        <span className="font-medium">Organism:</span> {protein.organism}
      </p>

      {protein.genes.length > 0 && (
        <p className="text-sm">
          <span className="font-medium">Genes:</span> {protein.genes.join(", ")}
        </p>
      )}

      {protein.function && (
        <p className="line-clamp-4 text-sm text-gray-700">{protein.function}</p>
      )}
    </li>
  );
}
