import type { User } from "firebase/auth";

type SettingsPanelProps = {
  user: User;
  favoritesCount: number;
  onClearHistory: () => void;
};

export function SettingsPanel({ user, favoritesCount, onClearHistory }: SettingsPanelProps) {
  const created = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "Unknown";

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
        <h3 className="font-heading font-bold text-on-surface mb-4">Account</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Email</dt>
            <dd className="text-on-surface font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Member since</dt>
            <dd className="text-on-surface font-medium">{created}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Saved proteins</dt>
            <dd className="text-on-surface font-medium">{favoritesCount}</dd>
          </div>
        </dl>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
        <h3 className="font-heading font-bold text-on-surface mb-2">Data</h3>
        <p className="text-sm text-on-surface-variant mb-3">
          Clear your locally stored search history. This does not affect your saved favorites.
        </p>
        <button
          type="button"
          onClick={onClearHistory}
          className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
        >
          Clear search history
        </button>
      </div>
    </div>
  );
}
