# Decision log

Every decision is agreed with the project owner before it is applied. Add new entries at the bottom; when a decision changes, add a new entry that references the old one instead of editing it.

## Product

| ID | Decision | Date |
|---|---|---|
| P1 | The product is a strategy tool for franchise teams, not a game | 2026-09-28 |
| P2 | v1 = minimal features, production-grade engineering and UI | 2026-09-28 |
| P3 | Proper team picker as the entry step; the app always opens on it | 2026-09-29 |
| P4 | One user can plan for multiple franchises; one plan per franchise in v1 | 2026-09-29 |
| P5 | Replay the latest real mini auction (2026 season); one auction in the data | 2026-09-29 |
| P6 | Retained players, purses and squad rules are fixed seed data served by the mock backend | 2026-09-29 |
| P7 | Pool = actually sold players + unsold players with base price ₹1 Cr and above | 2026-09-29 |
| P8 | Pool is read-only in v1 | 2026-09-29 |
| P9 | Plan-level rule breaks warn, never block | 2026-09-29 |
| P10 | Fully responsive: three panels (desktop), two columns (tablet), tabs (mobile) | 2026-09-29 |
| P11 | Light mode only in v1 | 2026-09-29 |
| P12 | Rival purses shown read-only at the bottom of the summary; always the official pre-auction values | 2026-09-29 |
| P13 | Picker shows a preview per franchise; in-workspace team switcher | 2026-09-29 |
| P14 | Real team logos, supplied by the owner; initials badge as fallback | 2026-09-29 |
| P15 | No player photos in v1; initials avatars | 2026-09-29 |
| P16 | Separate read-only detail dialog and add dialog. Detail opens from a pool row click or a plan item; add opens only from a pool row's Add button | 2026-09-29 |
| P17 | Real auction results stored for a future "plan vs reality" feature, not used in v1 | 2026-09-29 |

## Tech stack

| ID | Decision | Date |
|---|---|---|
| T1 | React + TypeScript on Vite | 2026-09-28 |
| T2 | TanStack Router, file-based routing | 2026-09-28 / 29 |
| T3 | TanStack Query for server state | 2026-09-28 |
| T4 | Zustand for client/UI state | 2026-09-28 |
| T5 | Zod for validation at every boundary; types derived with `z.infer` | 2026-09-28 |
| T6 | React Hook Form + Zod for forms | 2026-09-28 |
| T7 | Radix primitives via shadcn/ui | 2026-09-28 |
| T8 | Tailwind CSS with design tokens | 2026-09-28 |
| T9 | TanStack Table + TanStack Virtual for the pool | 2026-09-28 |
| T10 | json-server as mock backend (chosen over MSW + IndexedDB) | 2026-09-28 |
| T11 | Plain `fetch` in a typed API client (no Axios in v1) | 2026-09-28 |
| T12 | Vitest + React Testing Library; Playwright for E2E | 2026-09-28 |

## Domain

| ID | Decision | Date |
|---|---|---|
| D1 | `Player` (the person) is separate from `AuctionEntry` (the pool listing) | 2026-09-29 |
| D2 | Money stored and entered as whole lakh integers | 2026-09-29 |
| D3 | Nationality = fixed list of cricket-nation codes; overseas = not `IND` | 2026-09-29 |
| D4 | Targets embedded in the plan; autosave sends the whole plan | 2026-09-29 |
| D5 | Max safe bid = (purse − spend) − max(0, min − (count + 1)) × lowest base price; negative shows ₹0 plus warning | 2026-09-29 |
| D6 | Warnings: over purse, over max squad, over overseas cap, target above max safe bid, not enough purse for minimum squad. Below minimum squad = informational note | 2026-09-29 |
| D7 | Plan targets grouped by role; within a role, highest expected price first | 2026-09-29 |
| D8 | Pool filters: name search, role, overseas, capped, batting hand, bowling style, base-price range. Sorts: name, base price, age | 2026-09-29 |
| D9 | Age derived from date of birth as of the auction date | 2026-09-29 |
| D10 | Expected price required, pre-filled with base price, blocked below base price, any whole-lakh value, above purse allowed with warning | 2026-09-29 |
| D11 | Retained players count toward squad size, overseas count and role breakdown | 2026-09-29 |
| D12 | Money display: ₹X.XX Cr at ₹1 Cr and above (always 2 decimals); ₹N L below | 2026-09-29 |

## API

| ID | Decision | Date |
|---|---|---|
| A1 | Auction results in a separate resource v1 never fetches | 2026-09-29 |
| A2 | Plans seeded empty per franchise; plan id = franchise id | 2026-09-29 |
| A3 | Pool search, filter, sort and pagination done server-side | 2026-09-29 |
| A4 | Inline price edits save on blur or Enter; saves are sequential | 2026-09-29 |
| A5 | Invalid inline price shows an error and is not saved | 2026-09-29 |
| A6 | json-server as a Node module plus a custom `/pool` route implementing the contract | 2026-09-29 |
| A7 | Infinite scroll for the pool | 2026-09-29 |
| A8 | Search debounced by 300 ms | 2026-09-29 |
| A9 | Age sort implemented as date-of-birth sort | 2026-09-29 |
| I1 | Page size 25 | 2026-09-29 |
| I2 | Sort tie-break: name, then id | 2026-09-29 |
| I3 | Auto-load at the bottom plus a "Load more" button | 2026-09-29 |

## Structure

| ID | Decision | Date |
|---|---|---|
| F1 | Organise code by feature | 2026-09-29 |
| F2 | Shared Zod contracts in `shared/contracts`, used by the mock server and the app | 2026-09-29 |
| F3 | TanStack Router file-based routing | 2026-09-29 |
| F4 | Zustand stores live inside the feature that owns them | 2026-09-29 |
| F5 | Tests next to the file they test | 2026-09-29 |
| F6 | Each feature exposes an `index.ts` public API | 2026-09-29 |
| F7 | One npm package, no monorepo | 2026-09-29 |

## Setup and tooling

| ID | Decision | Date |
|---|---|---|
| S1 | All dependency versions pinned exactly (`save-exact=true`); npm as the package manager; Node 24 (`.nvmrc`) | 2026-09-29 |
| S2 | TypeScript 6.0.x, not 7.x: `typescript-eslint` supports TypeScript `<6.1` only. Revisit when it supports 7 | 2026-09-29 |
| S3 | json-server 0.17.4 (stable, documented module + custom-route API) over 1.0.0-beta (undocumented module API, no types, breaking changes expected) | 2026-09-29 |
| S4 | The app calls the mock server through a Vite dev proxy under `/api` (json-server on port 3001); no CORS | 2026-09-29 |
| S5 | The API base path lives in one constant in the API client (`API_BASE = '/api'`); requests never repeat it | 2026-09-29 |
| S6 | `eslint-plugin-boundaries` enforces the dependency rules in CLAUDE.md | 2026-09-29 |
| S7 | shadcn initialised with the Radix base and a neutral preset; design tokens set before the first real UI | 2026-09-29 |
| S8 | React Compiler off in v1 | 2026-09-29 |
| S9 | `src/routeTree.gen.ts` is committed and excluded from ESLint and Prettier | 2026-09-29 |
| S10 | TanStack Table (v8 vs v9) and TanStack Virtual installed when the pool is built, not at setup | 2026-09-29 |
| S11 | Zod 4 schemas passed directly to TanStack Router `validateSearch`; no `@tanstack/zod-adapter` | 2026-09-29 |
| S12 | ESLint (not Oxlint) with `typescript-eslint` strict type-checked rules; Prettier defaults plus the Tailwind class-sorting plugin | 2026-09-29 |
| S13 | Vitest runs in jsdom; Playwright runs Chromium desktop plus one mobile viewport | 2026-09-29 |
| S14 | `noUncheckedIndexedAccess` on in tsconfig | 2026-09-29 |
| S15 | No git hooks (husky/lint-staged) in v1; a single `check` script runs typecheck, lint and tests | 2026-09-29 |
| S16 | `cn()` comes from shadcn's `cn` package (replaces clsx + tailwind-merge; generated components import it directly). App code imports it via `@/lib/utils` | 2026-09-29 |
| S17 | shadcn "nova" preset (Radix base, neutral colours) as placeholder tokens; its Geist font removed, system font stack until design tokens are decided | 2026-09-29 |
| S18 | Dark token block removed (P11). The class-based `dark` variant is kept so `dark:` classes in shadcn components never follow the OS setting | 2026-09-29 |
| S19 | Path aliases are mirrored in the root `tsconfig.json` so the shadcn CLI resolves them | 2026-09-29 |
