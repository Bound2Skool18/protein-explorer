export type Element = "H" | "C" | "N" | "O";

export type Atom = {
  element: Element;
  position: [number, number, number];
};

export type Bond = [atomA: number, atomB: number];

export type Molecule = {
  name: string;
  formula: string;
  shape: string;
  atoms: Atom[];
  bonds: Bond[];
};

// CPK colors + approximate covalent / van-der-Waals radii (Angstroms).
export const ELEMENTS: Record<Element, { color: string; covalentRadius: number; vdwRadius: number }> = {
  H: { color: "#f4f4f5", covalentRadius: 0.31, vdwRadius: 1.2 },
  C: { color: "#3f3f46", covalentRadius: 0.76, vdwRadius: 1.7 },
  N: { color: "#3b82f6", covalentRadius: 0.71, vdwRadius: 1.55 },
  O: { color: "#ef4444", covalentRadius: 0.66, vdwRadius: 1.52 },
};
