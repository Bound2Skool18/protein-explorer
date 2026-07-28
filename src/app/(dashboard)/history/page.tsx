"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/viewmodels/useAuth";
import { useSearchHistory } from "@/viewmodels/useSearchHistory";
import { HistoryPanel } from "@/views/HistoryPanel";
import { SignInPrompt } from "@/views/SignInPrompt";

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const { history, clearHistory } = useSearchHistory(user?.uid);
  const router = useRouter();

  function selectQuery(query: string) {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return <SignInPrompt from="/history" message="Sign in to view your search history." />;
  }

  return (
    <section>
      <h2 className="font-heading text-3xl font-bold text-on-surface mb-6">Search History</h2>
      <HistoryPanel history={history} onSelect={selectQuery} onClear={clearHistory} />
    </section>
  );
}
