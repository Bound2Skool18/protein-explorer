import { useState } from "react";
import { searchProteins } from "../services/uniprot";
import type { Protein } from "../models/Protein";

export function useProteinSearch() {
  const [results, setResults] = useState<Protein[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(query: string) {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await searchProteins(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return { results, loading, error, search };
}
