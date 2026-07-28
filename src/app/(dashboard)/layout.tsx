"use client";

import { useState } from "react";
import { useAuth } from "@/viewmodels/useAuth";
import { AuthPanel } from "@/views/AuthPanel";
import { Sidebar } from "@/views/Sidebar";
import { TopNavBar } from "@/views/TopNavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, register, login, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <p className="p-6 text-sm text-on-surface-variant">Loading…</p>;
  }

  if (!user) {
    return <AuthPanel error={error} onLogin={login} onRegister={register} />;
  }

  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />
      <main className="flex-1 flex flex-col md:ml-64 h-full">
        <TopNavBar userEmail={user.email ?? ""} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-surface">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-24">{children}</div>
        </div>
      </main>
    </div>
  );
}
