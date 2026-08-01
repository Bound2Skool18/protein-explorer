"use client";

import { useRef, useState } from "react";
import { StatefulButton } from "./StatefulButton";

type SearchBarProps = {
  onSearch: (query: string) => Promise<void>;
  initialQuery?: string;
};

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Enter in the box triggers the button's own click, so it runs the same animated cycle.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    buttonRef.current?.click();
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
      <StatefulButton ref={buttonRef} onAction={() => onSearch(query)} />
    </form>
  );
}
