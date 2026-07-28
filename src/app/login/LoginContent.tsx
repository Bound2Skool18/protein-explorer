"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/viewmodels/useAuth";
import { AuthPanel } from "@/views/AuthPanel";

export function LoginContent() {
  const { user, error, login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/search";

  useEffect(() => {
    if (user) {
      router.push(from);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return <AuthPanel error={error} onLogin={login} onRegister={register} />;
}
