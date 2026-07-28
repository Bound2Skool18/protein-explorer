"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TopNavBarProps = {
  userEmail: string | null;
  onMenuClick: () => void;
};

const LINKS = [
  { href: "/search", label: "Browse" },
  { href: "/datasets", label: "Datasets" },
  { href: "/community", label: "Community" },
];

export function TopNavBar({ userEmail, onMenuClick }: TopNavBarProps) {
  const pathname = usePathname();
  const initial = userEmail?.charAt(0).toUpperCase();

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
      <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 max-w-[1200px] mx-auto">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 h-full">
          {LINKS.map((link) => {
            const active = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-secondary border-b-2 border-secondary pb-[1.125rem] pt-5 text-sm"
                    : "text-on-surface-variant hover:text-on-surface text-sm py-5"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {userEmail ? (
            <div
              title={userEmail}
              className="ml-2 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-heading text-sm font-bold border border-outline-variant"
            >
              {initial}
            </div>
          ) : (
            <Link
              href="/login"
              title="Log in"
              className="ml-2 w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center border border-outline-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
