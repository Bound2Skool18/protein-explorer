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

## Deployment

Connected to Vercel via GitHub — every push to `master` triggers a new deployment.
