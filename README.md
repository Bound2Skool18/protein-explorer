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

## Deployment

Connected to Vercel via GitHub — every push to `master` triggers a new deployment.
