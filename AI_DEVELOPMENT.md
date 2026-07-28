# AI-Assisted Development — Protein Explorer

Built with Claude Code as the primary development assistant, start to finish.
Live: https://protein-explorer-six.vercel.app · Repo: https://github.com/Bound2Skool18/protein-explorer

## How AI assisted

Claude Code did the actual typing — scaffolding, component code, Tailwind
styling, git operations, and deployment commands — but every non-trivial
decision was a back-and-forth, not a one-shot generation. The pattern that
worked: state the goal and constraints, let Claude propose an approach,
review what came back, and correct course when something was wrong, missing,
or over/under-scoped. Claude also did its own verification as it went —
running `tsc`/`next build` after every change, and testing flows in an
actual browser (register → search → favorite → reload) rather than just
asserting the code "should work." Several real bugs (below) were caught this
way, not by me spotting them after the fact.

The biggest architectural decision — migrating from a Vite SPA to Next.js
App Router — happened because Claude audited the app against a separate
deployment assignment's requirements, found the mismatch (no real routes,
not deployed, no health-check page), and laid out the gap before touching
any code, rather than silently picking a framework.

## Prompts used during development

Chronological, condensed to the prompts that actually shaped the app (not
every message):

1. "Let's make this project unique and separate from the suggested project idea, but still meeting the requirements." — rejected cloning the mentor's movie-app example; led to the Protein Explorer concept (UniProt search instead of OMDb, same shape: search + auth + saved favorites + MVVM).
2. "I like your pick" — approved Protein Explorer over the GitHub-repo-explorer and NASA-data alternatives.
3. "How do I create it for this specifically this time? I know I had problems before, so is everything on my end set up for Firebase to run correctly locally on my end." — asked for a diagnosis of prior Firebase setup failures before repeating them.
4. "What do I need to do right now to set up Firebase online?" — step-by-step console walkthrough.
5. Pasted the Firebase SDK config screenshot directly — used as the actual `.env` values.
6. "Just implement the tabs on the website that are currently working or fill them up with placeholder info for the sake of the internship project." — turned dead sidebar links into either real features (History, Settings) or honest "coming soon" placeholders, not fake functionality.
7. Stitch design screen fetch instructions, then "Implement this into the website." — ported a generated Material-Design mockup's colors/fonts/layout into the real app, with explicit deviations called out (dropped a duplicate search box and a stock-photo avatar as misleading UI, kept everything else).
8. FE-04 deployment assignment text, then "Migrate to Next.js App Router" (chosen over staying on Vite + react-router) — full framework migration to satisfy real routes, Server/Client Components, and a health-check page.
9. "Make it so that users can access the website fully, and if they click any features they would need an account for, they will be met with the login/register screen. But if they want to continue looking at the website without making an account, they can hit the back button and go back to the other screens." — reworked auth from a hard app-wide gate to per-feature gating, specifically so reviewers wouldn't be blocked from seeing the app.

## Manual corrections after reviewing AI-generated code

These are real defects Claude's own review passes or my testing caught —
not staged examples:

- **CSS cascade bug**: the Material Symbols icon font's hardcoded `font-size: 24px` was silently beating Tailwind's `text-4xl` utility because it was declared later in the stylesheet with equal specificity. Icons meant to be large stayed tiny. Fixed by wrapping the icon CSS in `@layer base` so Tailwind's utility layer reliably wins regardless of source order.
- **Firebase left wide open**: Realtime Database was set to test mode (default for a new project). Verified with a plain unauthenticated `curl` against the database URL — it returned every user's full favorites data, no credentials needed. Replaced with rules scoped to `favorites/$uid` matching `auth.uid`, then re-ran the same `curl` to confirm it now gets rejected.
- **Misleading UI from the design mockup**: the Stitch-generated redesign used a stock photo of a random person as the "profile avatar" and included a second, non-functional "quick search" box duplicating the real one. Both were cut rather than implemented as-is — a stranger's photo standing in for the logged-in user, and a fake search box, are the kind of thing a design tool generates without knowing it's wrong.
- **Build-breaking omission**: `useSearchParams()` in the search page needed a `<Suspense>` boundary or the production build fails outright (`next build` catches this, `next dev` doesn't — the bug was invisible until the actual deploy step). Restructured into a Server Component page wrapping a Client Component.
- **Redundant UI logic**: an early version of the search page had two separate "no results yet" messages — one hardcoded in the page, one already built into the shared `ProteinList` component. Caught on review and collapsed to one.
- **Auth architecture reset**: the entire dashboard was originally gated behind a single hard login check at the layout level, which meant reviewers hit a login wall before seeing anything. Reworked to gate only the features that actually need an account (Favorites, History, Settings, saving) while Search and the static pages stay public — a real product decision, not just a bug fix.
