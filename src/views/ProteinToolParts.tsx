import type { Protein } from "@/models/Protein";

// FE-07: the four tool-lifecycle states, each a DISTINCT shape (not the same
// card with a different label). Each answers a different user question.

// input-streaming → "What is it doing?"  (args still arriving; nothing to show yet)
export function ToolPending() {
  return (
    <div className="tool-fade flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
      <span className="sb-spinner sb-spinner--muted" aria-hidden />
      <span className="text-sm text-on-surface-variant">Preparing protein lookup…</span>
    </div>
  );
}

// input-available → "With what input?"  (args complete; execute is running)
export function ToolRunning({ query }: { query: string }) {
  return (
    <div className="tool-fade flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
      <span className="sb-spinner sb-spinner--muted" aria-hidden />
      <span className="text-sm text-on-surface-variant">
        Looking up <span className="font-medium text-on-surface">{query}</span> in UniProt…
      </span>
    </div>
  );
}

// output-available → "What came back?"  (the REAL component, not a JSON dump)
export function ProteinResultCard({ protein }: { protein: Protein }) {
  return (
    <div className="tool-fade rounded-xl border border-secondary/50 bg-surface-container-lowest p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-secondary">
        <span className="material-symbols-outlined text-[16px]">database</span>
        UniProt result
      </div>
      <h4 className="font-heading font-bold text-on-surface">{protein.name}</h4>
      <span className="font-mono text-xs tracking-wider text-on-surface-variant">
        {protein.id} · {protein.accession}
      </span>

      <div className="mt-3 flex flex-col gap-0.5">
        <span className="font-mono text-xs text-on-surface-variant">Organism</span>
        <span className="text-sm font-medium text-on-surface">{protein.organism}</span>
      </div>

      {protein.genes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {protein.genes.map((gene) => (
            <span
              key={gene}
              className="rounded-sm bg-secondary-container/20 px-2 py-0.5 font-mono text-xs text-secondary"
            >
              {gene}
            </span>
          ))}
        </div>
      )}

      {protein.function && (
        <p className="mt-3 border-t border-outline-variant/50 pt-3 text-sm text-on-surface-variant line-clamp-3">
          {protein.function}
        </p>
      )}
    </div>
  );
}

// output-error → "What went wrong?"  (designed error, never a crash)
export function ToolError({ message }: { message?: string }) {
  return (
    <div className="tool-fade rounded-xl border border-error/40 bg-error-container/30 px-4 py-3">
      <div className="flex items-center gap-2 text-on-error-container">
        <span className="material-symbols-outlined text-[18px]">error</span>
        <span className="text-sm font-medium">Lookup failed</span>
      </div>
      <p className="mt-1 text-xs text-on-surface-variant">
        {message ?? "Couldn't reach UniProt. Try rephrasing the protein name."}
      </p>
    </div>
  );
}
