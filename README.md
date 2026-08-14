# Protein Explorer

Search proteins via the [UniProt](https://www.uniprot.org/) REST API, sign in, and save favorites.

**Live:** https://protein-explorer-six.vercel.app
**Health check:** https://protein-explorer-six.vercel.app/health

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Firebase (Auth + Realtime Database) for accounts and favorites
- UniProt REST API for protein search (no key required)

## Structure

```
src/
  models/       # Shared types
  services/     # UniProt API client, Firebase init
  viewmodels/   # Client-side hooks (auth, search, favorites, history)
  views/        # Presentational components
  app/
    (dashboard)/  # Authenticated screens: search, favorites, history, settings, workspace, datasets, community
    health/       # Public, unauthenticated health-check page
```

## Local development

```bash
npm install
cp .env.example .env   # fill in your own Firebase project config
npm run dev
```

## Chat tool contract (FE-07)

The chat assistant (`/assistant`) can call a server-side tool to fetch real UniProt data and
render it as a component instead of prose.

- **name:** `lookupProtein`
- **input schema (Zod):** `{ query: string }` — a protein name, gene symbol, or keyword
- **return shape:** `Protein { accession, id, name, organism, genes: string[], function: string | null }`
- **states rendered distinctly** (`src/views/ProteinToolParts.tsx`):
  - `input-streaming` → pending row ("Preparing protein lookup…")
  - `input-available` → running row ("Looking up **{query}**…")
  - `output-available` → `ProteinResultCard` component
  - `output-error` → designed error card (thrown by `execute` when no entry is found)

Tool definition: [`src/services/chat-tools.ts`](src/services/chat-tools.ts). Registered in the AI
route (`src/app/api/chat/route.ts`) with `stopWhen: stepCountIs(5)` so the model calls the tool
and then writes a follow-up sentence.

## Stateful Search button — motion notes (FE-AA1)

The Search button (`src/views/StatefulButton.tsx`, live on `/search`) choreographs its full
lifecycle: **idle → hover/focus → loading → success/error → idle**, wired to the real UniProt
search. A demo toggle on `/search` forces the success and error states on demand.

Duration / easing choices:

- **200ms, `ease-out`** for color and label swaps — fast enough to feel instant, long enough to
  read as a transition rather than a snap.
- **240ms, `cubic-bezier(0.22, 1, 0.36, 1)`** for the label ↔ spinner ↔ check slide, so each layer
  *decelerates* into place instead of moving linearly.
- **400ms, `ease-in-out`** for the error shake — one quick, assertive wobble, then done.
- **700ms, linear** for the spinner loop — steady, so it reads as "working," not stuttering.

Only `transform` and `opacity` animate, and the button has a fixed `min-width`, so nothing
reflows (no layout thrash). It's interruptible (clicks are ignored mid-flight), keyboard
accessible with a visible focus ring, and honors `prefers-reduced-motion` — the slide and shake
are dropped, but color and fade feedback remain.

## 3D molecule viewer (Workspace)

`/workspace` is a small interactive 3D experience: a ball-and-stick / space-filling molecule
viewer built with **React Three Fiber**. Water, ammonia, methane, and carbon dioxide are rendered
from real bond lengths and bond angles computed in code (`src/services/molecules.ts`), not from a
loaded model file — there's no GLB/GLTF asset at all, so there's nothing to compress or optimize
on that front; the entire "model" is a few dozen floats.

- **Interactions beyond orbiting:** a [leva](https://github.com/pmndrs/leva) panel swaps the
  molecule, toggles ball-and-stick vs. space-filling rendering, and drives an auto-rotate
  animation; clicking an atom highlights it and labels it (element + index) via `<Html>`.
- **Loads responsibly:** `src/views/three/MoleculeScene.tsx` (three.js + `@react-three/fiber` +
  `@react-three/drei`) is loaded with `next/dynamic({ ssr: false })` from
  `src/views/MoleculeViewerPanel.tsx`, so it's fetched only when a visitor actually opens
  `/workspace` — every other route (`/search`, `/assistant`, etc.) never downloads it.
- **Fallbacks:** if `getContext("webgl")` fails, or if `prefers-reduced-motion` is set, the canvas
  is replaced by `src/views/three/WebGLFallback.tsx`, a static flat projection of the same atom
  coordinates (reduced-motion users get a "show it anyway" button, since that's a request they can
  make, not a capability they lack).
- **Frame budget:** the scene only re-renders continuously (`frameloop="always"`) while
  auto-rotate is on; otherwise it's `frameloop="demand"` — 0 extra frames/sec at idle, and drag
  input still invalidates and renders normally under "demand" (this is a documented drei
  `OrbitControls` behavior, not something bolted on). Geometry is a few dozen spheres/cylinders
  with no textures, so frame rate isn't a real constraint on any device this runs on.
- **Mobile:** `OrbitControls`' default touch mapping (one-finger rotate, two-finger pinch/pan)
  works out of the box. The leva panel is fixed-position and doesn't reflow on its own, so it
  starts **collapsed** below the `md` breakpoint (768px) instead of covering the canvas.

**Perf note (production build):** the three.js + `@react-three/fiber` + `@react-three/drei` chunk
is 964KB raw / 260KB gzipped; leva adds roughly another 150KB gzipped. That's a real cost — but
it's paid exactly once, exactly by visitors who open `/workspace`, entirely separate from the main
app bundle every other page ships. The lazy `next/dynamic` boundary is what makes that trade-off
acceptable; without it, every route in the app would carry three.js's weight.

**With more time:** DRACO-compressed real PDB structures (via three.js's `PDBLoader`) for actual
proteins instead of small illustrative molecules — the reason this stayed procedural is that
cartoon/ribbon secondary-structure rendering is its own significant project, not something to
bolt on inside a 5-hour assignment.

## Shader hero (`/about`, FE-AA3)

A fullscreen WebGL fragment shader — deep indigo → teal → violet flow ribbons (three summed sine
waves, not a noise texture), warped gently toward the cursor, with a vignette that keeps the
headline readable and a subtle grain pass to stop the gradient from banding. Plain WebGL rather
than react-three-fiber: it's a 2D effect with no scene graph, so a canvas + two small shaders is
the whole implementation (`src/views/ShaderHero.tsx`), no 3D library needed. Uses all three core
uniforms (`u_time`, `u_resolution`, `u_mouse`). GLSL source is commented section-by-section in the
same file.

**Perf/reduced-motion fallback in one line:** `prefers-reduced-motion` renders one static shader
frame instead of starting the animation loop, the tab-hidden case pauses/resumes the same loop via
the Page Visibility API, devicePixelRatio is capped at 2x for the canvas's backing store, and the
canvas has a static CSS gradient in the same palette as its own background — so a browser with no
WebGL support (or a failed context) shows that gradient and nothing ever throws.

## Deployment

Connected to Vercel via GitHub — every push to `master` triggers a new deployment.
