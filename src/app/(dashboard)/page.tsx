import { Suspense } from "react";
import { SearchPageContent } from "./search/SearchPageContent";

// The search page is the app's home -- rendered directly at `/` (no
// redirect to /search) so the primary flow doesn't cost an extra
// server round trip before anything paints.
export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-sm text-on-surface-variant">Loading…</p>}>
      <SearchPageContent />
    </Suspense>
  );
}
