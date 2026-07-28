import type { Tab } from "./Sidebar";

type TopNavBarProps = {
  userEmail: string;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
};

const LINKS: { tab: Tab; label: string }[] = [
  { tab: "search", label: "Browse" },
  { tab: "datasets", label: "Datasets" },
  { tab: "community", label: "Community" },
];

export function TopNavBar({ userEmail, activeTab, onNavigate }: TopNavBarProps) {
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-6 h-full">
          {LINKS.map((link) => {
            const active = link.tab === activeTab;
            return (
              <button
                key={link.tab}
                type="button"
                onClick={() => onNavigate(link.tab)}
                className={
                  active
                    ? "text-secondary border-b-2 border-secondary pb-[1.125rem] pt-5 text-sm"
                    : "text-on-surface-variant hover:text-on-surface text-sm py-5"
                }
              >
                {link.label}
              </button>
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
          <div
            title={userEmail}
            className="ml-2 w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-heading text-sm font-bold border border-outline-variant"
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
