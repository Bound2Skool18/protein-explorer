"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/viewmodels/useAuth";
import { useFavorites } from "@/viewmodels/useFavorites";
import { useProteinSearch } from "@/viewmodels/useProteinSearch";
import { useSearchHistory } from "@/viewmodels/useSearchHistory";
import { SearchBar } from "@/views/SearchBar";
import { ProteinList } from "@/views/ProteinList";
import type { Protein } from "@/models/Protein";

type DemoMode = "live" | "success" | "error";

export function SearchPageContent() {
  const { user } = useAuth();
  const { results, error, search } = useProteinSearch();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);
  const { addEntry } = useSearchHistory(user?.uid);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [demoMode, setDemoMode] = useState<DemoMode>("live");

  // Drives the Search button's success/error states. Demo mode lets reviewers force either on demand.
  async function runSearch(query: string) {
    addEntry(query);
    if (demoMode === "error") {
      await new Promise((r) => setTimeout(r, 700));
      throw new Error("Forced error (demo)");
    }
    await search(query);
  }

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery).catch(() => {}); // error already surfaced via viewmodel state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function toggleFavorite(protein: Protein) {
    if (!user) {
      router.push("/login?from=%2Fsearch");
      return;
    }
    if (isFavorite(protein.accession)) {
      removeFavorite(protein.accession);
    } else {
      addFavorite(protein);
    }
  }

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Explore Proteins</h2>
        <p className="text-on-surface-variant mb-6">
          Search proteins by name, gene, or organism via UniProt.
        </p>
        <SearchBar key={initialQuery} initialQuery={initialQuery} onSearch={runSearch} />

        {/* Demo control (FE-AA1): force the button's success / error states on demand. */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-on-surface-variant">Button demo:</span>
          <div className="inline-flex rounded-md border border-outline-variant overflow-hidden">
            {(["live", "success", "error"] as DemoMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDemoMode(m)}
                className={`px-2.5 py-1 capitalize transition-colors outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                  demoMode === m
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {m === "live" ? "Live search" : `Force ${m}`}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-error">
            {error}
          </p>
        )}
        {results.length === 0 && !error && (
          <p className="mt-3 text-sm text-on-surface-variant italic">
            No results yet — try a search above.
          </p>
        )}
      </section>

      {results.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
            <h3 className="font-heading text-xl font-semibold text-on-surface">Results</h3>
          </div>
          <ProteinList proteins={results} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
        </section>
      )}
    </div>
  );
}
