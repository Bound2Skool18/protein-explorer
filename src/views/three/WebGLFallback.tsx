import { ELEMENTS, type Molecule } from "@/models/Molecule";

const BOX = 180;

type WebGLFallbackProps = {
  molecule: Molecule;
  reason: "webgl" | "motion";
  onEnableAnyway?: () => void;
};

// A flat, non-interactive projection of the same atom coordinates the 3D
// scene uses (x/y only) -- so devices that can't run WebGL, or that asked
// for reduced motion, still see an accurate static preview instead of an
// empty box or an apology.
export function WebGLFallback({ molecule, reason, onEnableAnyway }: WebGLFallbackProps) {
  const xs = molecule.atoms.map((a) => a.position[0]);
  const ys = molecule.atoms.map((a) => a.position[1]);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const scale = (BOX * 0.7) / span;

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest py-10">
      <div className="relative" style={{ width: BOX, height: BOX }}>
        {molecule.atoms.map((atom, i) => {
          const el = ELEMENTS[atom.element];
          const size = el.vdwRadius * scale * 0.55;
          const left = BOX / 2 + (atom.position[0] - cx) * scale - size / 2;
          const top = BOX / 2 - (atom.position[1] - cy) * scale - size / 2;
          return (
            <span
              key={i}
              className="absolute rounded-full border border-black/10 shadow-sm"
              style={{ left, top, width: size, height: size, backgroundColor: el.color }}
            />
          );
        })}
      </div>
      <div className="text-center px-6">
        <p className="text-sm font-medium text-on-surface">
          {molecule.name} ({molecule.formula}) — static preview
        </p>
        <p className="mt-1 text-xs text-on-surface-variant max-w-xs">
          {reason === "webgl"
            ? "Your browser or device doesn't support WebGL, so here's a flat preview instead of the interactive 3D scene."
            : "Your device has reduced motion enabled, so the animated 3D scene is off by default."}
        </p>
        {reason === "motion" && onEnableAnyway && (
          <button
            type="button"
            onClick={onEnableAnyway}
            className="mt-3 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Show interactive 3D anyway
          </button>
        )}
      </div>
    </div>
  );
}
