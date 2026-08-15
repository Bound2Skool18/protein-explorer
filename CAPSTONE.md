# Capstone Submission — Protein Explorer

**Live:** https://protein-explorer-six.vercel.app
**Repo:** https://github.com/Bound2Skool18/protein-explorer
**Full README:** [README.md](README.md) · **Audit:** [AUDIT.md](AUDIT.md) · **Mental model:** [HOW_IT_WORKS.md](HOW_IT_WORKS.md)

This document is the single entry point for the capstone review — everything below either
answers a requirement directly or links to the file that does, so a reviewer doesn't have to hunt
across the repo.

## Project brief

Protein Explorer is a research tool for anyone who needs quick, trustworthy answers about a
protein — students, early biology researchers, or a curious developer who just wants to know what
a gene actually does — without digging through UniProt's own interface by hand. It searches real
UniProt data directly, and its AI assistant answers questions in plain language while grounding
every specific claim in a live UniProt lookup rather than letting the model guess. I chose it
because it let me combine a real external API, a genuinely useful (not decorative) AI feature, and
a 3D visualization into one coherent product instead of three disconnected demos.

## AI integration — why it's not a gimmick

The chat assistant (`/assistant`) doesn't just answer from the model's training data. When a user
asks about a specific protein, the model calls a server-side tool (`lookupProtein`) that hits the
real UniProt API; the returned data renders as an actual `ProteinResultCard` component, and the
model's prose explanation comes *after* and *references* that real data — it can't fabricate an
accession number or organism, because those come from a real HTTP response, not the model. This is
the whole point: an LLM's fluency is useful, its recall of specific facts isn't reliable, so the
architecture routes "what is true" through a real API and reserves the model for "explain this
clearly." Full contract, prompt, and the four rendered states: [README.md § Chat tool
contract](README.md#chat-tool-contract-fe-07).

## Architecture, setup, testing, and audit

These already exist as their own documents rather than duplicated here:

- **Setup & run instructions, env vars, folder structure:** [README.md](README.md) — `npm install
  && cp .env.example .env && npm run dev`, one command as asked.
- **Architecture overview:** [README.md § Architecture
  overview](README.md#architecture-overview) for the short version, [HOW_IT_WORKS.md](HOW_IT_WORKS.md)
  for a full request-trace walkthrough.
- **Testing evidence:** 42 Vitest/React Testing Library tests covering 9 of 17 view components
  (52.9%, clearing this capstone's own ≥50% bar) plus one Playwright end-to-end test of the
  primary search flow — [README.md § Testing](README.md#testing-fe-09). Writing the TopNavBar
  test surfaced a real accessible-name bug (a login link's accessible name was "person," not "Log
  in") that got fixed, not just tested around.
- **Performance & accessibility audit:** full Lighthouse mobile before/after (every page improved
  from failing the 80-point floor to 86–94; three of five clear 90) plus a real accessibility
  bug found by manual keyboard testing that no automated scanner caught —
  [AUDIT.md](AUDIT.md), with before/after screenshots.

## Deployment checklist

| Item | Status | Evidence |
|---|---|---|
| Environment variables set in production | ✅ Done | Vercel project settings; table of what's required in [README.md](README.md#environment-variables) |
| Custom domain | ⏭️ Skipped, intentionally | Optional per the brief; default `*.vercel.app` domain is live and stable |
| Cross-browser pass | ✅ Done (Chromium/Firefox automated), ⚠️ Safari by audit not live automation | [README.md § Cross-browser pass](README.md#cross-browser-pass) explains exactly why, honestly |
| Rate limiting / input caps on the AI route | ✅ Done, with a stated limitation | [README.md § Production hygiene](README.md#production-hygiene) — in-memory, not distributed; documented as such, not hidden |
| Sensible `maxDuration` on the streaming handler | ✅ Done | 30s, commented in `src/app/api/chat/route.ts` |
| Error states / fallbacks exist for real failure modes | ✅ Done | Chat retry card on stream failure, WebGL/`prefers-reduced-motion` fallbacks on both 3D pages, a dashboard `error.tsx` boundary |
| Tests pass before merging | ✅ Runs in CI | `.github/workflows/test.yml` on every push — **not yet wired to block the Vercel deploy itself** (known gap, see Known limitations) |
| Rollback procedure known | ✅ Documented | See below — procedure is real and tested manually via the CLI, not yet exercised as a full incident drill |

## Rollback plan & monitoring

**Rollback:** Vercel keeps every previous deployment addressable. Fastest path:
`npx vercel rollback <previous-deployment-url>`, or the same action from the Vercel dashboard
("Promote to Production" on any prior deployment) — no rebuild required, takes effect in under a
minute. Verified the command itself works (`vercel rollback --help`) during this submission;
haven't yet had a real incident to rehearse it against.

**Monitoring:** Vercel's built-in function logs and deployment status are the only monitoring in
place right now — no external APM or uptime alerting. Honest gap, not a hidden one: for an app at
this traffic level it hasn't mattered yet, and it's the first thing to add before this handled
real users (see Known limitations).

## Known limitations & future improvements

- **Rate limiting is per-instance, not distributed.** Real fix is a shared store (Upstash Redis /
  Vercel KV) — not added because the traffic to justify it doesn't exist yet, but the interface in
  `src/services/rate-limit.ts` is small enough to swap the implementation without touching the
  route handler.
- **CI passing doesn't currently gate the Vercel deploy.** They run independently on the same
  push. Worth tightening (Vercel's "Ignored Build Step" or a required-status-check branch
  protection rule) before this app has contributors other than me.
- **No monitoring/alerting beyond Vercel's own dashboard.** Fine at current scale; the first real
  gap to close if this ever needs to be reliable for someone other than a reviewer.
- **`/assistant` and `/workspace` sit at 87/86 Lighthouse performance, not 90+.** Traced to a
  specific, known cost each (react-markdown for rendering replies; three.js for the 3D scene) —
  already lazy-loaded so neither leaks onto other pages, but shrinking further means trimming a
  library, which means trimming the feature. Documented, not hand-waved, in `AUDIT.md`.
- **3D molecules are illustrative (water, ammonia, methane, CO₂), not real protein structures.**
  With more time: real PDB structures via three.js's `PDBLoader`, DRACO-compressed. Didn't fit
  this project's actual scope — cartoon/ribbon secondary-structure rendering is its own project.

## Reflection

**What was hardest, and why.** Not writing code — reading a contradiction. During the FE-10 audit,
Lighthouse reported `/workspace`'s Largest Contentful Paint at 5.5 seconds, on a page whose LCP
element turned out to be a plain paragraph of static text. Network requests all finished under 1.5
seconds; main-thread work was 0.5 seconds. Every individual number said "fast," and the headline
score said "slow." The easy, wrong move here is to start trying plausible-sounding performance
fixes (more code splitting, image optimization, anything) until the score moves. The actual fix
required doing the opposite — refusing to act until the contradiction resolved, eliminating
candidate explanations one at a time (server response time, then main-thread work, then network
waterfall) until exactly one was left standing: a Firebase auth check blocking the entire page's
first paint on every route, for every visitor, signed in or not. That habit — treating "the
numbers don't add up" as a signal to investigate further rather than a score to game — is the
single most transferable thing this capstone forced me to practice.

A close second, and a different kind of hard: during FE-11's cross-browser pass, Playwright's
local WebKit engine hung indefinitely on every single page load. I spent real time on it —
adjusting wait strategies, adding timeouts, retrying — before recognizing the actual signal
(Playwright's own install output had already warned that this WebKit build is "frozen" and
incompatible with this OS) and switching to a different verification method entirely (a compiled-
CSS feature audit) instead of continuing to debug a tool that was never going to cooperate. Knowing
when a problem isn't a bug in *your* code, and pivoting instead of grinding, turned out to be its
own skill.

**What I'd do differently.** Two things. First, I'd design the rate limiter's interface for a
shared store from day one, even while implementing the simple in-memory version — the honest
limitation documented in this submission was easy to accept only because I built it at the very
end, under the FE-11 deadline, instead of treating "what happens under real concurrent traffic"
as a question from the start. Second, I'd test performance and cross-browser work against a local
production build *first*, and only spot-check the real deployment once at the end — I ran enough
repeated automated Lighthouse/Playwright passes directly against the live Vercel URL during FE-10
and FE-11 that Vercel's own bot-mitigation started challenging my own traffic, which then blocked
*my* verification, self-inflicted.

**One thing that surprised me.** The single largest performance cost in the entire app (a 1.68MB
image fetched just for lighting reflections on a handful of matte spheres) and the single most
*widespread* one (three.js and react-markdown quietly downloading on every dashboard page, not
just the pages that use them) both came from features that looked completely reasonable in
isolation — nicer lighting, faster navigation via link prefetching — and were invisible until I
went looking with an actual network trace instead of trusting intuition about what "the 3D page"
or "the chat page" should cost. Framework defaults you never explicitly chose can be the biggest
line item on the bill, and they don't show up unless you specifically look.
