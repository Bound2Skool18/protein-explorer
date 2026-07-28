"use client";

import { useAuth } from "@/viewmodels/useAuth";
import { useFavorites } from "@/viewmodels/useFavorites";
import { ProteinList } from "@/views/ProteinList";
import type { Protein } from "@/models/Protein";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.uid);

  function toggleFavorite(protein: Protein) {
    if (isFavorite(protein.accession)) {
      removeFavorite(protein.accession);
    } else {
      addFavorite(protein);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
        <h3 className="font-heading text-xl font-semibold text-on-surface">Favorites</h3>
      </div>
      <ProteinList proteins={favorites} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
    </section>
  );
}
