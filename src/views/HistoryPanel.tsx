type HistoryPanelProps = {
  history: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
};

export function HistoryPanel({ history, onSelect, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant italic">
        No searches yet — your recent searches will show up here.
      </p>
    );
  }

  return (
    <div className="max-w-xl space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={onClear} className="text-sm text-secondary hover:underline">
          Clear history
        </button>
      </div>
      <ul className="divide-y divide-outline-variant border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden">
        {history.map((query) => (
          <li key={query}>
            <button
              type="button"
              onClick={() => onSelect(query)}
              className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
              <span className="text-sm text-on-surface">{query}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
