import { useEffect, useState } from "react";

const MAX_ENTRIES = 20;

function storageKey(uid: string) {
  return `protein-explorer.search-history.${uid}`;
}

export function useSearchHistory(uid: string | undefined) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (!uid) {
      setHistory([]);
      return;
    }
    const raw = localStorage.getItem(storageKey(uid));
    setHistory(raw ? (JSON.parse(raw) as string[]) : []);
  }, [uid]);

  function addEntry(query: string) {
    if (!uid || !query.trim()) return;
    setHistory((prev) => {
      const next = [query, ...prev.filter((q) => q !== query)].slice(0, MAX_ENTRIES);
      localStorage.setItem(storageKey(uid), JSON.stringify(next));
      return next;
    });
  }

  function clearHistory() {
    if (!uid) return;
    setHistory([]);
    localStorage.removeItem(storageKey(uid));
  }

  return { history, addEntry, clearHistory };
}
