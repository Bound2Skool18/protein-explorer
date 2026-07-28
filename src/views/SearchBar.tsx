import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  loading: boolean;
};

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="protein-search" className="sr-only">
        Search proteins
      </label>
      <input
        id="protein-search"
        type="search"
        placeholder="Search proteins (e.g. insulin, hemoglobin, BRCA1)"
        className="flex-1 rounded border px-3 py-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
