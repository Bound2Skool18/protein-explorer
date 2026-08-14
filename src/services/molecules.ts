import type { Molecule } from "@/models/Molecule";

const DEG = Math.PI / 180;

// Idealized VSEPR geometries, built from real bond lengths and bond angles
// rather than hand-typed coordinates, so the shapes are correct by
// construction instead of eyeballed.

function water(): Molecule {
  const bond = 0.96;
  const half = (104.5 / 2) * DEG;
  return {
    name: "Water",
    formula: "H₂O",
    shape: "Bent",
    atoms: [
      { element: "O", position: [0, 0, 0] },
      { element: "H", position: [bond * Math.sin(half), -bond * Math.cos(half), 0] },
      { element: "H", position: [-bond * Math.sin(half), -bond * Math.cos(half), 0] },
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  };
}

function ammonia(): Molecule {
  const bond = 1.01;
  const hnh = 107 * DEG;
  // Cone half-angle (from the -z axis) that produces the target H-N-H angle
  // for three bonds spaced 120° apart azimuthally.
  const cos2phi = (Math.cos(hnh) + 0.5) / 1.5;
  const phi = Math.acos(Math.sqrt(cos2phi));
  const atoms: Molecule["atoms"] = [{ element: "N", position: [0, 0, 0] }];
  for (let i = 0; i < 3; i++) {
    const az = i * 120 * DEG;
    atoms.push({
      element: "H",
      position: [
        bond * Math.sin(phi) * Math.cos(az),
        bond * Math.sin(phi) * Math.sin(az),
        -bond * Math.cos(phi),
      ],
    });
  }
  return {
    name: "Ammonia",
    formula: "NH₃",
    shape: "Trigonal pyramidal",
    atoms,
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  };
}

function methane(): Molecule {
  const bond = 1.09;
  // The four vertex directions of a regular tetrahedron centered at the origin.
  const directions: [number, number, number][] = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ];
  const atoms: Molecule["atoms"] = [{ element: "C", position: [0, 0, 0] }];
  for (const [x, y, z] of directions) {
    const len = Math.sqrt(x * x + y * y + z * z);
    atoms.push({ element: "H", position: [(x / len) * bond, (y / len) * bond, (z / len) * bond] });
  }
  return {
    name: "Methane",
    formula: "CH₄",
    shape: "Tetrahedral",
    atoms,
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  };
}

function carbonDioxide(): Molecule {
  const bond = 1.16;
  return {
    name: "Carbon dioxide",
    formula: "CO₂",
    shape: "Linear",
    atoms: [
      { element: "O", position: [-bond, 0, 0] },
      { element: "C", position: [0, 0, 0] },
      { element: "O", position: [bond, 0, 0] },
    ],
    bonds: [
      [0, 1],
      [1, 2],
    ],
  };
}

export const MOLECULES = {
  water: water(),
  ammonia: ammonia(),
  methane: methane(),
  carbonDioxide: carbonDioxide(),
} satisfies Record<string, Molecule>;

export type MoleculeKey = keyof typeof MOLECULES;
