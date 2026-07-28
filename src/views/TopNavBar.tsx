type TopNavBarProps = {
  userEmail: string;
};

export function TopNavBar({ userEmail }: TopNavBarProps) {
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-6 h-full">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-secondary border-b-2 border-secondary pb-[1.125rem] pt-5 text-sm"
          >
            Browse
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-on-surface-variant hover:text-on-surface text-sm py-5"
          >
            Datasets
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-on-surface-variant hover:text-on-surface text-sm py-5"
          >
            Community
          </a>
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
