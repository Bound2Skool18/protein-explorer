import { useEffect, useState } from "react";
import { onValue, ref, remove, set } from "firebase/database";
import { db } from "../services/firebase";
import type { Protein } from "../models/Protein";

export function useFavorites(uid: string | undefined) {
  const [favorites, setFavorites] = useState<Record<string, Protein>>({});

  useEffect(() => {
    if (!uid) {
      setFavorites({});
      return;
    }
    const favRef = ref(db, `favorites/${uid}`);
    return onValue(favRef, (snapshot) => {
      setFavorites(snapshot.val() ?? {});
    });
  }, [uid]);

  function isFavorite(accession: string) {
    return accession in favorites;
  }

  async function addFavorite(protein: Protein) {
    if (!uid) return;
    await set(ref(db, `favorites/${uid}/${protein.accession}`), protein);
  }

  async function removeFavorite(accession: string) {
    if (!uid) return;
    await remove(ref(db, `favorites/${uid}/${accession}`));
  }

  return { favorites: Object.values(favorites), isFavorite, addFavorite, removeFavorite };
}
