import { useAuth } from "./viewmodels/useAuth";
import { useFavorites } from "./viewmodels/useFavorites";
import { useProteinSearch } from "./viewmodels/useProteinSearch";
import { AuthPanel } from "./views/AuthPanel";
import { Sidebar } from "./views/Sidebar";
import { TopNavBar } from "./views/TopNavBar";
import { SearchBar } from "./views/SearchBar";
import { ProteinList } from "./views/ProteinList";
import type { Protein } from "./models/Protein";

export function App() {
  const { user, loading, error, register, login, logout } = useAuth();
  const { results, loading: searchLoading, error: searchError, search } = useProteinSearch();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);

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

  return (
    <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden">
      <Sidebar onLogout={logout} />

      <main className="flex-1 flex flex-col md:ml-64 h-full">
        <TopNavBar userEmail={user.email ?? ""} />

        <div className="flex-1 overflow-y-auto bg-surface">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-24 space-y-8">
            <section className="max-w-3xl">
              <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Explore Proteins</h2>
              <p className="text-on-surface-variant mb-6">
                Search proteins by name, gene, or organism via UniProt.
              </p>
              <SearchBar onSearch={search} loading={searchLoading} />
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

            <section>
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
                <h3 className="font-heading text-xl font-semibold text-on-surface">Favorites</h3>
              </div>
              <ProteinList proteins={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
