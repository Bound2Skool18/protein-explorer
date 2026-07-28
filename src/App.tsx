import { useAuth } from "./viewmodels/useAuth";
import { useFavorites } from "./viewmodels/useFavorites";
import { useProteinSearch } from "./viewmodels/useProteinSearch";
import { AuthPanel } from "./views/AuthPanel";
import { SearchBar } from "./views/SearchBar";
import { ProteinList } from "./views/ProteinList";
import type { Protein } from "./models/Protein";

export function App() {
  const { user, loading, error, register, login, logout } = useAuth();
  const { results, loading: searchLoading, error: searchError, search } = useProteinSearch();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);

  if (loading) {
    return <p className="p-6 text-sm text-gray-600">Loading…</p>;
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
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Protein Explorer</h1>
        <button type="button" onClick={logout} className="text-sm underline">
          Log out ({user.email})
        </button>
      </header>

      <section className="space-y-3">
        <SearchBar onSearch={search} loading={searchLoading} />
        {searchError && (
          <p role="alert" className="text-sm text-red-600">
            {searchError}
          </p>
        )}
        <ProteinList proteins={results} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Favorites</h2>
        <ProteinList proteins={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
      </section>
    </div>
  );
}
