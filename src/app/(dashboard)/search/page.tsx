import { Suspense } from "react";
import { SearchPageContent } from "./SearchPageContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-on-surface-variant">Loading…</p>}>
      <SearchPageContent />
    </Suspense>
  );
}
