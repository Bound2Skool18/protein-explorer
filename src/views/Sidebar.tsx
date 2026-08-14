"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  userEmail: string | null;
  onLogout: () => void;
};

// `/assistant` (react-markdown) and `/workspace` (three.js + leva) each pull
// in a heavy chunk. Next.js prefetches every visible Link's route by
// default, which was loading both bundles on every dashboard page just
// because the sidebar linking to them is always on screen -- prefetch is
// off for those two so only visiting the route itself pays for it.
const NAV_ITEMS = [
  { href: "/search", icon: "search", label: "Search", prefetch: true },
  { href: "/assistant", icon: "smart_toy", label: "Assistant", prefetch: false },
  { href: "/favorites", icon: "grade", label: "Favorites", prefetch: true },
  { href: "/history", icon: "history", label: "History", prefetch: true },
  { href: "/workspace", icon: "biotech", label: "Workspace", prefetch: false },
  { href: "/settings", icon: "settings", label: "Settings", prefetch: true },
];

export function Sidebar({ open, onClose, userEmail, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col py-8 bg-surface-container-low border-r border-outline-variant z-30 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined fill">biotech</span>
            </div>
            <h1 className="font-heading text-lg font-bold text-on-surface">Protein Explorer</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ul className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={item.prefetch}
                  onClick={onClose}
                  className={
                    active
                      ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary font-bold border-r-4 border-secondary bg-secondary-container/20"
                      : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-all"
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-mono text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-4 pt-4 border-t border-outline-variant/30">
          {userEmail ? (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-mono text-sm">Log Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary font-bold hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined">login</span>
              <span className="font-mono text-sm">Log In</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
