# How Protein Explorer works (the simple version)

This is the plain-language map of the whole app: what each piece does, why it exists, and how
they connect. Read this before diving into `README.md`'s technical detail.

## The one-sentence mental model

**Protein Explorer is a Next.js app where every screen is one of three shapes: fetch real data
and display it, fetch real data and let an AI explain it, or render something with no server data
at all (the 3D molecule viewer).** Everything else — auth, testing, deployment, the performance
work — exists to make those three shapes fast, accessible, and safe to keep changing.

## The four folders, and why the split exists

```
models/       "What is a Protein?" -- just types, no logic.
services/     "How do I get a Protein from the outside world?" -- UniProt, Firebase, the AI tools.
viewmodels/   "What does a screen need to know, and how does it change over time?" -- React hooks.
views/        "What does it look like?" -- components. No fetching, no business logic.
```

The rule of thumb: **data flows down this list, never sideways or up.** A `view` never calls
`fetch` directly — it calls a `viewmodel` hook, which calls a `service`, which returns a `model`.
If you're ever unsure where new code belongs, ask "is this a shape of data, a way to fetch it, a
piece of state, or a piece of UI?" — that's the folder.

`app/` is Next.js's routing layer on top of all that: each folder under `app/` is a URL, and
`page.tsx` inside it is what renders there. The `(dashboard)` folder is a **route group** — the
parentheses mean "share a layout, but don't add `/dashboard` to the URL." That's why `/search` and
`/workspace` both get the sidebar/top-nav chrome from one shared `layout.tsx`, while `/login` and
`/health` (outside the group) don't.

## The three screen shapes

### Shape 1: fetch and display — `/search`

```
SearchBar (view)
  → useProteinSearch (viewmodel: holds results/loading/error state)
    → searchProteins (service: calls UniProt's REST API)
      → Protein[] (model: the shape everything downstream expects)
```

Nothing here is Protein-Explorer-specific — it's the same fetch → state → render loop as any
data-driven app. `useFavorites` and `useSearchHistory` are the same pattern again, pointed at
Firebase instead of UniProt.

### Shape 2: fetch, but let an AI narrate it — `/assistant`

This is the same shape with one extra hop: instead of the *view* deciding what data to show, the
*model* decides, by calling a **tool**.

```
You type "what is insulin?"
  → POST /api/chat (server) streams your message to Groq's Llama 3.3
  → The model reads chat-tools.ts's description of `lookupProtein` and decides
    to call it (it doesn't run any code itself -- it emits a structured request)
  → The AI SDK, server-side, actually runs lookupProtein.execute()
      = the exact same searchProteins() from Shape 1, reused
  → The Protein comes back, gets streamed to the browser as a typed "tool part"
  → Chat.tsx switches on that part's state (pending/running/done/error)
    and renders ProteinResultCard -- a real component, not the model's prose
  → The model then writes a sentence explaining it in its own words
```

The mental model worth keeping: **the AI never touches your data layer directly.** It can only
ask for a tool to run, with arguments it fills in (which it can get wrong — that's why the tool's
input is validated with Zod). Your server decides whether to actually run it. This is why the tool
result renders as a real `ProteinResultCard`, not as text the model made up — the numbers on
screen came from UniProt, same as `/search`, just triggered by a conversation instead of a form.

### Shape 3: no server data at all — `/workspace`

The molecule viewer is the odd one out on purpose: water, ammonia, methane, and CO₂ are computed
from real bond lengths and angles *in the browser*, so there's no `service` fetching anything and
no `model` beyond "an array of atom positions." It exists to practice a different skill (3D
rendering, not data-fetching), and it's structured to make that obvious: `MoleculeScene.tsx` is
the entire "backend" for this screen.

## The stuff that isn't a screen: auth, testing, CI, performance

These don't fit the three shapes above because they're not features — they're what makes the
features trustworthy over time.

**Auth (`useAuth`, Firebase)** is a thin wrapper most screens barely notice: `user` is either
`null` (signed out) or a real Firebase user object. Every screen is written to work correctly with
`user: null` — search works, browsing works — and only *write* actions (saving a favorite) check
for it and redirect to `/login` if it's missing. This is deliberate: nothing blocks on auth
resolving, which turned out to matter a lot (see the performance section below).

**Testing** mirrors the four-folder split: `Chat.test.tsx` and `ProteinToolParts.test.tsx` test
Shape 2's rendering by *mocking* `useChat` (the AI SDK hook) so the real network is never hit —
you're testing "does the UI react correctly to this state," not "does Groq work today."
`AuthPanel.test.tsx` tests Shape 1's form validation the same way. `tests/e2e/search.spec.ts` is
the one test that's allowed to touch a real browser end-to-end, with UniProt's API mocked at the
network layer so it's not dependent on a third party being up.

**CI (`.github/workflows/test.yml`)** runs that whole suite on every push. The mental model: it's
a second, automated version of "did I break anything," running the same commands you'd run
locally, so a regression shows up as a red X on the PR instead of in production.

**Deployment** is push-triggered: every push to `master` both runs CI *and* triggers a new Vercel
build, independently. They don't gate each other today — CI passing doesn't block the Vercel
deploy — which is worth knowing if you ever want that to be stricter.

**The performance/accessibility audit (`AUDIT.md`)** is the newest layer, and it's worth
understanding as its own mental model: it's not a feature, it's a *budget*. Every screen shape
above is free to add JavaScript, images, or network calls — the audit is what caught that budget
being blown (a 1.1MB icon font on every page, a 1.68MB 3D lighting image, every route's JS being
pre-fetched everywhere) and fixed the actual causes instead of chasing the score number. See
`AUDIT.md` for the full before/after story.

## Tracing one real click, start to finish

To tie all of the above together, here's literally everything that happens when you load
`/search` and search "insulin":

1. **Routing:** Next.js matches `app/(dashboard)/search/page.tsx`, wrapped in
   `app/(dashboard)/layout.tsx` (sidebar + top nav) and `app/layout.tsx` (fonts, global CSS).
2. **Auth (non-blocking):** `DashboardLayout` calls `useAuth()`. `user` starts `null` and the page
   renders immediately — it does **not** wait for Firebase before showing anything.
3. **The view:** `SearchPageContent` renders `SearchBar`, wired to `useProteinSearch()`.
4. **You type and hit the button:** `SearchBar`'s `StatefulButton` calls `onSearch(query)`, which
   is `useProteinSearch`'s `search()`.
5. **The viewmodel:** sets `loading: true`, calls the **service** `searchProteins()`.
6. **The service:** builds a UniProt REST URL, `fetch`es it, maps the raw JSON into the **model**
   shape (`Protein[]`) — this is the only place in the app that knows UniProt's response format.
7. **Back up the chain:** the viewmodel sets `results`, the view re-renders `ProteinList` →
   `ProteinCard`s.
8. **If you click a card's Save star:** that's `useFavorites()`, which either writes to Firebase
   Realtime Database (if `user` resolved by now) or redirects to `/login` (if not) — the one place
   this screen actually cares whether auth finished.

Every other screen in the app is a variation on this same eight-step shape, with the "service"
step swapped for Firebase, Groq, or nothing at all.
