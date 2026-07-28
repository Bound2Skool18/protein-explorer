"use client";

import { useAuth } from "@/viewmodels/useAuth";
import { useFavorites } from "@/viewmodels/useFavorites";
import { useSearchHistory } from "@/viewmodels/useSearchHistory";
import { SettingsPanel } from "@/views/SettingsPanel";

export default function SettingsPage() {
  const { user } = useAuth();
  const { favorites } = useFavorites(user?.uid);
  const { clearHistory } = useSearchHistory(user?.uid);

  if (!user) {
    return null;
  }

  return (
    <section>
      <h2 className="font-heading text-3xl font-bold text-on-surface mb-6">Settings</h2>
      <SettingsPanel user={user} favoritesCount={favorites.length} onClearHistory={clearHistory} />
    </section>
  );
}
