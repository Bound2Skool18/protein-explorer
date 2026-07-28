type ComingSoonPanelProps = {
  icon: string;
  title: string;
  description: string;
};

export function ComingSoonPanel({ icon, title, description }: ComingSoonPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">{icon}</span>
      <h3 className="font-heading text-lg font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm">{description}</p>
    </div>
  );
}
