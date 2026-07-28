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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <label htmlFor="protein-search" className="sr-only">
        Search proteins
      </label>
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute inset-y-0 left-4 flex items-center text-on-surface-variant pointer-events-none">
          search
        </span>
        <input
          id="protein-search"
          type="search"
          placeholder="Search proteins (e.g. insulin, hemoglobin, BRCA1)"
          className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-secondary focus:border-secondary transition-all shadow-sm outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-on-primary px-6 py-3.5 rounded-lg hover:opacity-90 transition-opacity font-bold shadow-sm whitespace-nowrap disabled:opacity-50"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
