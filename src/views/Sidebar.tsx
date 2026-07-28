type SidebarProps = {
  onLogout: () => void;
};

const NAV_ITEMS = [
  { icon: "search", label: "Search", active: true },
  { icon: "grade", label: "Favorites", active: false },
  { icon: "history", label: "History", active: false },
  { icon: "biotech", label: "Workspace", active: false },
  { icon: "settings", label: "Settings", active: false },
];

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col py-8 bg-surface-container-low border-r border-outline-variant z-20">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined fill">biotech</span>
          </div>
          <h1 className="font-heading text-lg font-bold text-on-surface">Protein Explorer</h1>
        </div>
      </div>

      <ul className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className={
                item.active
                  ? "flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary font-bold border-r-4 border-secondary bg-secondary-container/20"
                  : "flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-all"
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-mono text-sm">{item.label}</span>
            </a>
          </li>
        ))}
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
  );
}
