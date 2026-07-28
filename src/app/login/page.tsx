import { Suspense } from "react";
import { LoginContent } from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-on-surface-variant">Loading…</p>}>
      <LoginContent />
    </Suspense>
  );
}
