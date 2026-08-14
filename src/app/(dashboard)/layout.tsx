"use client";

import { useState } from "react";
import { useAuth } from "@/viewmodels/useAuth";
import { Sidebar } from "@/views/Sidebar";
import { TopNavBar } from "@/views/TopNavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // `loading` no longer blocks the whole page behind a blank screen -- every
  // route here (search, chat, workspace) already renders correctly for a
  // signed-out visitor, so there's nothing to gain by waiting on Firebase
  // before painting anything. This was the actual LCP bottleneck: Lighthouse
  // was measuring plain page text as the "largest contentful paint" element,
  // arriving seconds late only because it sat behind this gate. The
  // logged-in-only chrome (avatar, logout) just renders once `user` resolves.
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background text-on-background flex h-dvh overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={user?.email ?? null}
        onLogout={logout}
      />
      <main className="flex-1 flex flex-col md:ml-64 h-full">
        <TopNavBar userEmail={user?.email ?? null} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto bg-surface">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 pb-24">{children}</div>
        </div>
      </main>
    </div>
  );
}
