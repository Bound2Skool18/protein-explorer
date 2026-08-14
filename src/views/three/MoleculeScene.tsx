"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import { ELEMENTS, type Atom, type Molecule } from "@/models/Molecule";

export type MoleculeStyle = "ballAndStick" | "spaceFilling";

type MoleculeSceneProps = {
  molecule: Molecule;
  moleculeStyle: MoleculeStyle;
  autoRotate: boolean;
  autoRotateSpeed: number;
  frameloop: "always" | "demand";
  selectedAtom: number | null;
  onSelectAtom: (index: number | null) => void;
};

function atomRadius(atom: Atom, style: MoleculeStyle) {
  const el = ELEMENTS[atom.element];
  return style === "spaceFilling" ? el.vdwRadius * 0.55 : el.covalentRadius * 0.6;
}

function AtomMesh({
  atom,
  index,
  style,
  selected,
  onSelect,
}: {
  atom: Atom;
  index: number;
  style: MoleculeStyle;
  selected: boolean;
  onSelect: (index: number | null) => void;
}) {
  const radius = atomRadius(atom, style);
  return (
    <mesh
      position={atom.position}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onSelect(selected ? null : index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={ELEMENTS[atom.element].color}
        roughness={0.4}
        metalness={0.05}
        emissive={selected ? "#facc15" : "#000000"}
        emissiveIntensity={selected ? 0.6 : 0}
      />
      {selected && (
        <Html distanceFactor={8} position={[0, radius + 0.2, 0]} center>
          <div className="rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-mono text-on-surface shadow-sm whitespace-nowrap">
            {atom.element} · atom {index}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function BondMesh({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return { position: mid, quaternion: quat, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[0.08, 0.08, length, 12]} />
      <meshStandardMaterial color="#a1a1aa" roughness={0.5} />
    </mesh>
  );
}

function MoleculeModel({
  molecule,
  moleculeStyle,
  selectedAtom,
  onSelectAtom,
}: {
  molecule: Molecule;
  moleculeStyle: MoleculeStyle;
  selectedAtom: number | null;
  onSelectAtom: (index: number | null) => void;
}) {
  return (
    <group>
      {moleculeStyle === "ballAndStick" &&
        molecule.bonds.map(([a, b], i) => (
          <BondMesh key={i} from={molecule.atoms[a].position} to={molecule.atoms[b].position} />
        ))}
      {molecule.atoms.map((atom, i) => (
        <AtomMesh
          key={i}
          atom={atom}
          index={i}
          style={moleculeStyle}
          selected={selectedAtom === i}
          onSelect={onSelectAtom}
        />
      ))}
    </group>
  );
}

// This whole module (three + fiber + drei) is loaded lazily via next/dynamic
// from MoleculeViewerPanel, so it never lands in the main route bundle.
export default function MoleculeScene({
  molecule,
  moleculeStyle,
  autoRotate,
  autoRotateSpeed,
  frameloop,
  selectedAtom,
  onSelectAtom,
}: MoleculeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={frameloop}
      camera={{ position: [2.5, 2, 3.5], fov: 45 }}
      onPointerMissed={() => onSelectAtom(null)}
      role="img"
      aria-label={`3D model of ${molecule.name} (${molecule.formula}), ${molecule.shape.toLowerCase()}. The caption below this scene has the same information and lists the controls.`}
    >
      {/* Plain lights instead of drei's <Environment>: an HDRI preset is a
          ~1.7MB fetch (from a third-party CDN) for reflections on a handful
          of matte spheres -- not worth the payload for this scene. Three
          lights approximate the same "staged" look for a few KB of code. */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={0.3} />
      <MoleculeModel
        molecule={molecule}
        moleculeStyle={moleculeStyle}
        selectedAtom={selectedAtom}
        onSelectAtom={onSelectAtom}
      />
      <ContactShadows position={[0, -1.6, 0]} opacity={0.4} blur={2.4} scale={6} far={4} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={2}
        maxDistance={9}
      />
    </Canvas>
  );
}
