# IPL Auction Planner

A UI-only strategy tool for IPL franchises to plan auction targets within purse and squad rules. Replays the latest real mini auction (2026 season). A mock server stands in for the backend.

- Product requirements: `docs/requirements.md` (source of truth)
- Decision log: `docs/decisions.md`

## Working rules

- **Act as a senior frontend engineer building a scalable, production-grade codebase.** It is a fun project, but the code and UI must look and work like production.
- **Every decision is discussed with the owner first. Make no assumptions.** If something is not covered in `docs/requirements.md` or `docs/decisions.md`, stop and ask, offering options with trade-offs and a recommendation.
- Once a decision is agreed, add it to `docs/decisions.md` (and update `docs/requirements.md` if it changes the product).
- Do not add features beyond v1 scope without agreement.
- Explain unfamiliar concepts when asked; the owner wants to understand the stack, not just receive code.

## Stack

React + TypeScript (strict) · Vite · TanStack Router (file-based) · TanStack Query · Zustand · Zod · React Hook Form · Radix primitives via shadcn/ui · Tailwind CSS · TanStack Table + TanStack Virtual · json-server (as a Node module with custom routes) · plain `fetch` · Vitest + React Testing Library · Playwright · ESLint + Prettier.

Pin versions at setup and check each tool's current docs before using version-specific APIs (especially json-server, Tailwind v4, TanStack Router, shadcn CLI).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | App (Vite, :5173) and mock server (:3001) together; the app reaches the server via the `/api` proxy |
| `npm run dev:app` / `npm run dev:mock` | Run one side only (`dev:mock` restarts on change) |
| `npm run db:reset` | Validate `db.seed.json`, then restore `mock-server/db.json` from it (refuses an invalid seed) |
| `npm run db:validate` | Check `db.seed.json` against the strict contracts and cross-record rules; sources in `docs/data-sources.md` |
| `npm run check` | Typecheck, lint, format check, and unit tests with coverage (100% required on `src/domain/**`); run before every commit |
| `npm run typecheck` | `tsc -b` across app, node config and mock server projects |
| `npm run lint` / `npm run lint:fix` | ESLint, including architecture boundary rules |
| `npm run format` / `npm run format:check` | Prettier (Markdown and `routeTree.gen.ts` excluded) |
| `npm test` / `npm run test:watch` / `npm run test:coverage` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright (desktop + mobile); starts both servers and resets the database from the seed |
| `npm run build` / `npm run preview` | Production build and local preview |

Add shadcn components with `npx shadcn@4.21.0 add <name>` (pinned CLI version), then run `npm run format` and `npm run lint`.

## Project structure

```
CLAUDE.md
docs/                 requirements.md, decisions.md
mock-server/          server.ts, routes/pool.ts, db.seed.json, db.json (git-ignored), reset-db.ts
shared/contracts/     Zod schemas + inferred types for API requests/responses (used by mock server AND app)
public/logos/         franchise logos (supplied by the owner)
e2e/                  Playwright tests
src/
  main.tsx
  app/                providers, router setup, QueryClient
  routes/             file-based routes: / (picker), /teams/$teamId (workspace)
  api/                typed fetch client + one module per resource
  domain/             pure TypeScript, no React: rules, money, age, overseas, summary, warnings
  features/
    team-picker/  workspace/  player-pool/  player-detail/  plan/  summary/
  components/ui/      shadcn components (generic only)
  components/common/  app-wide pieces (InitialsAvatar, TeamLogo, Money)
  lib/                cn() and small utilities
  styles/index.css    Tailwind entry + design tokens
  test/               test setup and helpers
```

## Architecture rules

**Dependencies**
- `routes` → `features` → `components`, `api`, `domain`, `lib`.
- `domain` imports nothing from the app (pure functions, fully unit-tested).
- Features import other features only through their `index.ts` public API.
- `components/ui` stays generic: no player, team or auction knowledge. App-specific components live in features.

**State**
- Server data (auction, franchises, retentions, players, pool, plans) → TanStack Query only. Never copy it into Zustand.
- Client/UI state → Zustand store inside the owning feature.
- URL state (pool filters, search, sort, mobile tab) → TanStack Router search params validated with Zod.
- Derived values (age, overseas, summary metrics, max safe bid, warnings, note, picker previews) → computed by pure functions in `domain/`, never stored.

**API and data**
- Components never call `fetch`; they use hooks built on the typed API client in `api/`.
- The API client throws on non-2xx responses and validates responses with the Zod schemas from `shared/contracts`.
- Query keys are defined in one place per resource (key factories), not written ad hoc.
- Money is whole lakh integers everywhere; format only at display time via the shared money formatter.
- Plan saves are optimistic with rollback, and sequential (an older save must never overwrite a newer one).

**Styling**
- Tailwind utilities with semantic design tokens only (`bg-primary`, `text-muted-foreground`). No raw palette colours (`bg-blue-600`) in feature code.
- Class names must be complete strings; no dynamic construction like `bg-${color}-500`.
- Use `cn()` for conditional and merged classes; `cva` for component variants.
- Light mode only for v1.

**Quality**
- Every data view has proper loading, empty and error states.
- Accessible by default: keyboard operable, visible focus, labelled controls, dialogs via Radix.
- Tests live next to the file they test (`maxSafeBid.test.ts` beside `maxSafeBid.ts`). `domain/` must be fully unit-tested.
- Strict TypeScript; no `any` without a comment explaining why.

## Pending decisions (settle before building the related UI)

- Final nationality code list (after compiling the data)

## Data task

Seed data must be compiled from reliable public sources and verified: franchises, official pre-auction purses, squad rules, retention lists, the auction pool (sold players + unsold with base ≥ ₹1 Cr), and results. Show the owner the sources and the compiled data for review before committing `db.seed.json`.
