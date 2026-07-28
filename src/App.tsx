import { useState } from "react";
import { useAuth } from "./viewmodels/useAuth";
import { useFavorites } from "./viewmodels/useFavorites";
import { useProteinSearch } from "./viewmodels/useProteinSearch";
import { useSearchHistory } from "./viewmodels/useSearchHistory";
import { AuthPanel } from "./views/AuthPanel";
import { Sidebar, type Tab } from "./views/Sidebar";
import { TopNavBar } from "./views/TopNavBar";
import { SearchBar } from "./views/SearchBar";
import { ProteinList } from "./views/ProteinList";
import { HistoryPanel } from "./views/HistoryPanel";
import { SettingsPanel } from "./views/SettingsPanel";
import { ComingSoonPanel } from "./views/ComingSoonPanel";
import type { Protein } from "./models/Protein";

export function App() {
  const { user, loading, error, register, login, logout } = useAuth();
  const { results, loading: searchLoading, error: searchError, search } = useProteinSearch();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);
  const { history, addEntry, clearHistory } = useSearchHistory(user?.uid);
  const [tab, setTab] = useState<Tab>("search");

  if (loading) {
    return <p className="p-6 text-sm text-on-surface-variant">Loading…</p>;
  }

  if (!user) {
    return <AuthPanel error={error} onLogin={login} onRegister={register} />;
  }

  function toggleFavorite(protein: Protein) {
    if (isFavorite(protein.accession)) {
      removeFavorite(protein.accession);
    } else {
      addFavorite(protein);
    }
  }

  function runSearch(query: string) {
    search(query);
    addEntry(query);
  }

  function searchFromHistory(query: string) {
    setTab("search");
    runSearch(query);
  }

  return (
    <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden">
      <Sidebar activeTab={tab} onNavigate={setTab} onLogout={logout} />

      <main className="flex-1 flex flex-col md:ml-64 h-full">
        <TopNavBar userEmail={user.email ?? ""} activeTab={tab} onNavigate={setTab} />

        <div className="flex-1 overflow-y-auto bg-surface">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-24 space-y-8">
            {tab === "search" && (
              <>
                <section className="max-w-3xl">
                  <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Explore Proteins</h2>
                  <p className="text-on-surface-variant mb-6">
                    Search proteins by name, gene, or organism via UniProt.
                  </p>
                  <SearchBar onSearch={runSearch} loading={searchLoading} />
                  {searchError && (
                    <p role="alert" className="mt-3 text-sm text-error">
                      {searchError}
                    </p>
                  )}
                  {results.length === 0 && !searchError && (
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
              </>
            )}

            {tab === "favorites" && (
              <section>
                <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                  <h3 className="font-heading text-xl font-semibold text-on-surface">Favorites</h3>
                </div>
                <ProteinList proteins={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
              </section>
            )}

            {tab === "history" && (
              <section>
                <h2 className="font-heading text-3xl font-bold text-on-surface mb-6">Search History</h2>
                <HistoryPanel history={history} onSelect={searchFromHistory} onClear={clearHistory} />
              </section>
            )}

            {tab === "settings" && (
              <section>
                <h2 className="font-heading text-3xl font-bold text-on-surface mb-6">Settings</h2>
                <SettingsPanel user={user} favoritesCount={favorites.length} onClearHistory={clearHistory} />
              </section>
            )}

            {tab === "workspace" && (
              <ComingSoonPanel
                icon="biotech"
                title="Workspace"
                description="Organize proteins into custom research collections. Coming soon."
              />
            )}

            {tab === "datasets" && (
              <ComingSoonPanel
                icon="dataset"
                title="Datasets"
                description="Browse curated protein reference datasets. Coming soon."
              />
            )}

            {tab === "community" && (
              <ComingSoonPanel
                icon="forum"
                title="Community"
                description="Discuss findings with other researchers using Protein Explorer. Coming soon."
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
