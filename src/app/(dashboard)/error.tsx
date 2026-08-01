"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// Catches render/route errors thrown by any dashboard PAGE (search, assistant,
// favorites, …). It renders inside the dashboard layout, so the sidebar/nav
// stay put and only the content area shows this fallback.
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void; // Next 16.2+: re-fetches AND re-renders the segment
}) {
  useEffect(() => {
    // In prod, Server Component errors are masked; `error.digest` matches the
    // real message in the server logs.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 text-on-error-container">
        <span className="material-symbols-outlined text-[22px]">error</span>
        <h2 className="font-heading text-lg font-bold">Something went wrong</h2>
      </div>
      <p className="mt-2 max-w-sm text-sm text-on-surface-variant">
        This page hit an unexpected error. It&apos;s usually temporary — try again.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-all hover:opacity-90 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Try again
      </button>
    </div>
  );
}
