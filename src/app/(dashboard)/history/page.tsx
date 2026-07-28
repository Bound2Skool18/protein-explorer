"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/viewmodels/useAuth";
import { useSearchHistory } from "@/viewmodels/useSearchHistory";
import { HistoryPanel } from "@/views/HistoryPanel";

export default function HistoryPage() {
  const { user } = useAuth();
  const { history, clearHistory } = useSearchHistory(user?.uid);
  const router = useRouter();

  function selectQuery(query: string) {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section>
      <h2 className="font-heading text-3xl font-bold text-on-surface mb-6">Search History</h2>
      <HistoryPanel history={history} onSelect={selectQuery} onClear={clearHistory} />
    </section>
  );
}
