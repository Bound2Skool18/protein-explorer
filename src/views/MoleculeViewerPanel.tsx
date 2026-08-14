"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Leva, useControls } from "leva";
import { MOLECULES, type MoleculeKey } from "@/services/molecules";
import type { MoleculeStyle } from "./three/MoleculeScene";
import { WebGLFallback } from "./three/WebGLFallback";

const CANVAS_HEIGHT = 440;

function CanvasSkeleton({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-on-surface-variant animate-pulse"
      style={{ height: CANVAS_HEIGHT }}
    >
      {label}
    </div>
  );
}

// @react-three/fiber's Canvas needs a real WebGL context and browser globals
// at mount time, so it can never run during SSR. next/dynamic with
// ssr:false keeps three.js + fiber + drei out of the server bundle
// entirely, and out of the client bundle until this panel actually mounts.
const MoleculeScene = dynamic(() => import("./three/MoleculeScene"), {
  ssr: false,
  loading: () => <CanvasSkeleton label="Loading 3D scene…" />,
});

const MOLECULE_OPTIONS: Record<string, MoleculeKey> = {
  Water: "water",
  Ammonia: "ammonia",
  Methane: "methane",
  "Carbon dioxide": "carbonDioxide",
};

function noopSubscribe() {
  return () => {};
}

function getWebGLSnapshot(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function getWebGLServerSnapshot(): boolean | null {
  return null;
}

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean | null {
  return null;
}

// Matches the `md` breakpoint the rest of the dashboard shell already
// collapses around (see Sidebar's `md:translate-x-0`). Leva's floating
// panel doesn't reflow on its own, so below this width it starts
// collapsed instead of covering most of the canvas.
function subscribeNarrowViewport(callback: () => void) {
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getNarrowViewportSnapshot(): boolean {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getNarrowViewportServerSnapshot(): boolean {
  return false;
}

export function MoleculeViewerPanel() {
  // Browser-only capability reads via useSyncExternalStore, not
  // useEffect+setState: the server snapshot (null) and the client's first
  // hydration render match exactly, then React re-renders with the real
  // client value right after -- no manual effect, no hydration mismatch,
  // and the reduced-motion check live-updates if the OS setting changes.
  const supportsWebGL = useSyncExternalStore(noopSubscribe, getWebGLSnapshot, getWebGLServerSnapshot);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const isNarrowViewport = useSyncExternalStore(
    subscribeNarrowViewport,
    getNarrowViewportSnapshot,
    getNarrowViewportServerSnapshot
  );
  const [forceInteractive, setForceInteractive] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);

  const {
    molecule: moleculeKey,
    style: moleculeStyle,
    autoRotate,
    autoRotateSpeed,
  } = useControls("Molecule viewer", {
    molecule: { value: "water" as MoleculeKey, options: MOLECULE_OPTIONS },
    style: {
      value: "ballAndStick" as MoleculeStyle,
      options: { "Ball & stick": "ballAndStick", "Space filling": "spaceFilling" } as Record<
        string,
        MoleculeStyle
      >,
    },
    autoRotate: false,
    autoRotateSpeed: { value: 1.5, min: 0.2, max: 4, step: 0.1 },
  });

  const molecule = MOLECULES[moleculeKey];

  // Atom indices don't carry over between molecules -- clear the selection
  // as part of the moleculeKey-change render itself (React's documented
  // "adjusting state when a prop changes" pattern) rather than in an effect.
  const [prevMoleculeKey, setPrevMoleculeKey] = useState(moleculeKey);
  if (moleculeKey !== prevMoleculeKey) {
    setPrevMoleculeKey(moleculeKey);
    setSelectedAtom(null);
  }

  // Frames only render continuously while something needs to keep moving
  // (the auto-rotate animation); otherwise the scene sits idle at 0 extra
  // frames/sec until a drag or scroll asks for one.
  const frameloop = autoRotate ? "always" : "demand";

  const showStaticFallback =
    supportsWebGL === true && prefersReducedMotion === true && !forceInteractive;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {supportsWebGL === null ? (
          <CanvasSkeleton label="Checking device capabilities…" />
        ) : supportsWebGL === false ? (
          <WebGLFallback molecule={molecule} reason="webgl" />
        ) : showStaticFallback ? (
          <WebGLFallback molecule={molecule} reason="motion" onEnableAnyway={() => setForceInteractive(true)} />
        ) : (
          <div style={{ height: CANVAS_HEIGHT }}>
            <MoleculeScene
              molecule={molecule}
              moleculeStyle={moleculeStyle}
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
              frameloop={frameloop}
              selectedAtom={selectedAtom}
              onSelectAtom={setSelectedAtom}
            />
          </div>
        )}
      </div>
      <p className="text-xs text-on-surface-variant">
        {molecule.name} ({molecule.formula}) — {molecule.shape}. Drag to orbit, scroll or pinch to
        zoom, click an atom to label it.
      </p>
      {/* Leva's default dark theme has a low-contrast title/label color
          (~1.9:1 against its panel background, WCAG requires 4.5:1) --
          overridden here since it's the only accessibility failure the
          Lighthouse audit found on this page. */}
      <Leva
        collapsed={isNarrowViewport}
        titleBar={{ title: "Molecule controls" }}
        theme={{
          colors: {
            highlight1: "#c7c7cf",
            highlight2: "#e4e4e7",
            highlight3: "#ffffff",
            folderTextColor: "#e4e4e7",
          },
        }}
      />
    </div>
  );
}
