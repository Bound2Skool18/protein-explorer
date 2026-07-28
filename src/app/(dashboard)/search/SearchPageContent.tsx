"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/viewmodels/useAuth";
import { useFavorites } from "@/viewmodels/useFavorites";
import { useProteinSearch } from "@/viewmodels/useProteinSearch";
import { useSearchHistory } from "@/viewmodels/useSearchHistory";
import { SearchBar } from "@/views/SearchBar";
import { ProteinList } from "@/views/ProteinList";
import type { Protein } from "@/models/Protein";

export function SearchPageContent() {
  const { user } = useAuth();
  const { results, loading, error, search } = useProteinSearch();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);
  const { addEntry } = useSearchHistory(user?.uid);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  function runSearch(query: string) {
    search(query);
    addEntry(query);
  }

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
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
        <SearchBar key={initialQuery} initialQuery={initialQuery} onSearch={runSearch} loading={loading} />
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
