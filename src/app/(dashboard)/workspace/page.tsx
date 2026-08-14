import { MoleculeViewerPanel } from "@/views/MoleculeViewerPanel";

export default function WorkspacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold text-on-surface mb-2">Workspace</h2>
        <p className="text-on-surface-variant">
          A small interactive 3D molecule viewer — swap molecules, change rendering style, and
          inspect atoms.
        </p>
      </div>
      <MoleculeViewerPanel />
    </div>
  );
}
