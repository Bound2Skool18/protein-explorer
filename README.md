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

## Deployment

Connected to Vercel via GitHub — every push to `master` triggers a new deployment.
