import type { Protein } from "../models/Protein";

type ProteinCardProps = {
  protein: Protein;
  isFavorite: boolean;
  onToggleFavorite: (protein: Protein) => void;
};

export function ProteinCard({ protein, isFavorite, onToggleFavorite }: ProteinCardProps) {
  return (
    <li className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:border-secondary transition-all flex flex-col list-none">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div>
          <h3 className="font-heading font-bold text-on-surface">{protein.name}</h3>
          <span className="font-mono text-xs text-on-surface-variant tracking-wider">
            {protein.id} · {protein.accession}
          </span>
        </div>
        <button
          type="button"
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(protein)}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md border border-outline-variant bg-surface-container-low text-on-surface text-xs hover:bg-surface-container-high transition-colors"
        >
          <span className={isFavorite ? "material-symbols-outlined fill text-[16px]" : "material-symbols-outlined text-[16px]"}>
            star
          </span>
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-on-surface-variant">Organism</span>
          <span className="text-sm text-on-surface font-medium">{protein.organism}</span>
        </div>

        {protein.genes.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-on-surface-variant">Genes</span>
            <div className="flex flex-wrap gap-1">
              {protein.genes.map((gene) => (
                <span
                  key={gene}
                  className="font-mono text-xs text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-sm"
                >
                  {gene}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {protein.function && (
        <div className="pt-4 border-t border-outline-variant/50">
          <p className="line-clamp-3 text-sm text-on-surface-variant">{protein.function}</p>
        </div>
      )}
    </li>
  );
}
