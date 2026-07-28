"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const NAV_ITEMS = [
  { href: "/search", icon: "search", label: "Search" },
  { href: "/favorites", icon: "grade", label: "Favorites" },
  { href: "/history", icon: "history", label: "History" },
  { href: "/workspace", icon: "biotech", label: "Workspace" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export function Sidebar({ open, onClose, onLogout }: SidebarProps) {
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
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-mono text-sm">Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}
