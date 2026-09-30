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
| S20 | Mock server serves everything under `/api` (same base path as the app, so the proxy forwards unchanged); `db.json` is created from the seed on first start if missing | 2026-09-29 |
| S21 | E2E runs reset the mock database from the seed before starting the mock server | 2026-09-29 |
| S22 | Vitest configured inside `vite.config.ts` (shares plugins and aliases); explicit imports, no test globals | 2026-09-29 |
| S23 | `react-refresh/only-export-components` off for route files: the TanStack Router plugin code-splits route components and handles their HMR | 2026-09-29 |
| S24 | TanStack Query default options kept for now; tuned when the data hooks are built | 2026-09-29 |

## Visual design

| ID | Decision | Date |
|---|---|---|
| V1 | Feel: neutral base with one strong accent; data-focused, not flashy | 2026-09-29 |
| V2 | Accent: teal. `primary` teal-700 (white text 5.39:1), `ring` teal-600 (3.66:1 on white), `accent` teal-50 with teal-900 text (9.08:1). Light mode only | 2026-09-29 |
| V3 | Each workspace picks up its franchise's colours as an accent | 2026-09-29 |
| V4 | Font: Inter, with tabular figures for all numbers (set once on `body`) | 2026-09-29 |
| V5 | Radius: 8px (`--radius: 0.5rem`) | 2026-09-29 |
| V6 | Density: compact (14px base text, compact controls). On all touch devices (`pointer: coarse`, tablets included) tappable elements are at least 44px via the `touch-target` utility | 2026-09-29 |
| V7 | Status colours: warnings amber, note blue (`info`), errors red (`destructive`), within limits green (`success`). Each has base, `-foreground`, `-subtle` and `-subtle-foreground` tokens, all WCAG AA checked | 2026-09-29 |
| V8 | Breakpoints: below 768px mobile (tabs), 768–1279px tablet (two columns + sticky summary strip), 1280px and up desktop (three panels). Tailwind's default `md` (768px) and `xl` (1280px) match exactly; layout code uses only those two | 2026-09-29 |
| V9 | Team colour appears only on the workspace header, team badge, active mobile tab and picker card accent. Buttons, links, focus rings and selected rows stay teal | 2026-09-29 |
| V10 | Team colours are for fills and accents only, never body text; each colour has a paired text colour chosen for contrast | 2026-09-29 |
| V11 | `Franchise` gains `colors: { primary, onPrimary, secondary, onSecondary }` in the shared contracts and seed data. Secondary is used minimally: a thin stripe or border in the workspace header and on the team badge. Schema added in the foundation step; CSK and RCB pairs, contrast-checked, come with the starter seed | 2026-09-29 |
| V12 | Inter self-hosted via `@fontsource-variable/inter`; no Google Fonts | 2026-09-29 |
| V13 | Two preset neutrals changed to pass WCAG: `muted-foreground` `oklch(0.52 0 0)` (preset failed at 4.34:1 on muted) and `input` borders `oklch(0.64 0 0)` (3:1 for form fields). Preset sidebar and chart tokens removed | 2026-09-29 |
| V14 | Team colours are CSS variables (`--team`, `--team-foreground`, `--team-secondary`, `--team-secondary-foreground`) set inline from `franchise.colors` on the workspace root and each picker card; they default to teal when no franchise is in scope | 2026-09-29 |

## Foundation

| ID | Decision | Date |
|---|---|---|
| N1 | Provisional starter seed until the full dataset is verified: CSK and RCB only, their real retained players, and about 20 real auction-pool players (mix of roles, overseas/Indian, capped/uncapped, sold and notable unsold). Player list and sources reviewed by the owner before writing | 2026-09-29 |
| N2 | Dev latency and failure simulation in the mock server via environment flags (e.g. `MOCK_DELAY`, `MOCK_FAIL_RATE`), off by default, with npm scripts to run with them on | 2026-09-29 |
| N3 | A seed validation script checks `db.seed.json` against the shared Zod contracts; it runs as part of the reset step and in tests | 2026-09-29 |
| N4 | TanStack Query defaults: read-only data (auction, franchises, players, retentions, pool) uses `staleTime: Infinity` and no refetch on window focus; plans use normal freshness with refetch on window focus. Reads retry 1–2 times; autosave mutations don't retry (roll back and show an error). Supersedes S24 | 2026-09-29 |
| N5 | Foundation order, one commit per step: (1) shared Zod contracts incl. `Franchise.colors` (V11); (2) starter seed + validation + reset scripts; (3) `domain/`, fully unit-tested; (4) mock server `/pool` route with tests; (5) API client, query key factories, query/mutation hooks per resource | 2026-09-29 |
| N6 | IDs are lowercase kebab-case and immutable (never recalculated from a changed name): franchise = short name (`csk`), player = name slug (`virat-kohli`, `-2` on a clash), auction entry = season + player slug (`2026-virat-kohli`) | 2026-09-29 |
| N7 | Franchise colours are `#RRGGBB` hex strings | 2026-09-29 |
| N8 | Enum values are lowercase kebab codes (`all-rounder`, `left-arm-wrist-spin`); display labels live in `domain/`. Nationality codes are uppercase; provisional list = the 12 ICC Full Members, confirmed after the data is compiled | 2026-09-29 |
| N9 | Contract schemas strip unknown keys (the app's response parsing). Seed validation and the mock server use `toStrict()`, which rejects unknown keys at every depth | 2026-09-29 |
| N10 | Pool role and bowling-style filters are multi-select, sent comma-separated; OR within a filter, AND across filters. Batting hand stays single-select | 2026-09-29 |
| N11 | Default pool sort: base price, highest first. Without `order`: base price desc, name asc, age asc (youngest first) | 2026-09-29 |
| N12 | `Plan.updatedAt` is null on seeded plans and set by the mock server on every save. The PUT body (`SavePlanRequest`) omits `updatedAt` | 2026-09-29 |
| N13 | Pool rows nest the player (`{ id, basePriceLakh, player }`); age and overseas are not in rows (derived in `domain/`). `HOME_NATIONALITY = "IND"` lives in the contracts so the server filter and `domain/` share it. Pool `pageSize` capped at 100 | 2026-09-29 |
| N14 | Franchise colour-pair contrast (WCAG AA, 4.5:1) is enforced by seed validation, not by the contract, so the app never rejects a response over styling | 2026-09-29 |
| N15 | The provisional status of the seed is stated in `docs/data-sources.md`, and `db:reset` prints a reminder; nothing extra is stored in the seed | 2026-09-30 |
| N16 | Auction name: "IPL 2026 Player Auction" (no sponsor name) | 2026-09-30 |
| N17 | Player names follow the official source (auction list for pool players, iplt20.com for retained), except where common usage clearly differs; every exception (official value, value used, reason) is listed in `docs/data-sources.md` | 2026-09-30 |
| N18 | All data is as of the auction date (16 Dec 2025); later changes are ignored and, where sources disagree, the source closest to that date wins | 2026-09-30 |
| N19 | Batting hand and bowling style from Cricbuzz (ESPNcricinfo where Cricbuzz has no profile). Mapping: fast and fast-medium → `*-fast`; medium-fast and medium → `*-medium`; part-timers keep their listed style. Livingstone (bowls both) stored as `off-spin` | 2026-09-30 |
| N20 | Retained players' roles from iplt20.com as of the auction: squad page first, then player page | 2026-09-30 |
| N21 | Capped status follows the IPL rule (Player Regulations 2025–27): an internationally capped Indian player is uncapped only with no starting-XI international in the preceding 5 calendar years AND no BCCI central contract. Contracts applied: the 2024–25 list, the latest published on the auction date. Overseas internationals are capped | 2026-09-30 |
| N22 | Franchise colours from the official club websites. RCB secondary is gold `#E7C641` with `#101612` text | 2026-09-30 |
| N23 | `logoPath` is left out until the owner adds logo files; the initials badge also shows when a logo image fails to load | 2026-09-30 |
| N24 | Starter seed: sold results are checked against the fixed list of the 10 IPL franchise IDs, since only CSK and RCB are seeded as franchises. See follow-up FU1 | 2026-09-30 |
| S25 | Vitest runs two projects: `app` (jsdom, browser setup) for `src/`, and `node` for `shared/` and `mock-server/` | 2026-09-30 |

## Follow-ups

Agreed work that is not done yet. Remove an entry when it is done, and reference the commit.

| ID | Follow-up | Raised |
|---|---|---|
| FU1 | Once all 10 franchises are seeded, seed validation must require sold results to reference an existing franchise, replacing the fixed-list check from N24 | 2026-09-30 |
| D13 | Warning "a target's expected price exceeds the current max safe bid" dropped. D6 now has four warnings: over purse, over max squad, over overseas cap, not enough purse for the minimum squad | 2026-09-30 |
| D14 | Negative amounts display with a minus sign (−₹1.20 Cr, U+2212) and an accessible label that reads "minus" | 2026-09-30 |
| D15 | Header and picker figures (purse, open slots, open overseas slots) are the baseline after retentions and before any plan, labelled that way (e.g. "Purse before auction"); the plan's effect shows only in the summary | 2026-09-30 |
| S26 | 100% coverage (lines, branches, functions, statements) on `src/domain/**`, enforced in `npm run check` | 2026-09-30 |
| D16 | Amends D5 and D6: the "not enough purse for the minimum squad" warning has its own condition, independent of max safe bid: `slotsShort = max(0, minSquadSize − squadCount)`; it fires when `slotsShort > 0` and `remaining < slotsShort × lowestBasePrice`. So it never fires once the minimum is met (over purse is its own warning), and it does fire one player short even when max safe bid is positive. Max safe bid formula and ₹0 display unchanged | 2026-09-30 |
| N25 | Amends N2: simulation settings are command-line arguments to the mock server (`--delay <ms\|min-max>`, `--fail-rate <0-1>`), not environment variables, so the scripts work on Windows without extra dependencies. Scripts: `dev:slow` (300–1200 ms), `dev:flaky` (0.2), `dev:chaos` (both) | 2026-09-30 |
| N26 | The mock server serves only the agreed API: every write except `PUT /plans/:franchiseId` returns 405 with an `Allow` header; `GET /auctionResults` returns 404. The PUT body is validated strictly against the plan contract and needs an existing franchise | 2026-09-30 |
| N27 | Pool search is case- and accent-insensitive. The name-then-id tie-break is always ascending. Error responses are `{ error, issues? }` | 2026-09-30 |
| N28 | `GET /auctionEntries` added as static reference data (never stale); with `/players` it resolves any plan target on the client, so optimistic adds show immediately | 2026-09-30 |
| N29 | Reads retry twice with TanStack Query's default backoff, only for network errors and 5xx; never for 4xx or contract mismatches | 2026-09-30 |
| N30 | Plan saves: whole plan per save, optimistic, serialised with a TanStack Query mutation scope per plan. Latest wins: roll back to the last server-confirmed plan only when the failed save is the latest; "Try again" resends the failed plan (user-initiated). Plan refetches (mount, focus, reconnect) are skipped while saves are queued | 2026-09-30 |

## UI

| ID | Decision | Date |
|---|---|---|
| UI1 | App header on every page (brand links to `/`). Picker header: h1 "Choose a team to plan for" and the auction name and date; squad rules are left to the workspace | 2026-09-30 |
| UI2 | Picker grid: 1 column on mobile, 2 on tablet (`md:`), 4 on desktop (`xl:`), content capped at `max-w-7xl` | 2026-09-30 |
| UI3 | Data views: skeletons shaped like the real content while loading (with `aria-busy` and a hidden status), an error panel with "Try again" that refetches only the failed queries and takes focus, and a muted empty state. Pages that need several queries show one error state if any fails | 2026-09-30 |
| UI4 | shadcn components keep their upstream shape; their `cva` variant exports are allowed in `src/components/ui` only (lint exception) | 2026-09-30 |
| UI5 | Clickable cards use the stretched-link pattern: the team name is the only link and covers the card, so the card is one tab stop and the link's name is just the team name. Focus shows as a teal ring on the whole card | 2026-09-30 |
| UI6 | Picker cards: alphabetical by full name; hierarchy name → purse → open slots → overseas slots → plan status, figures in a `<dl>` under one "Before the auction" caption (D15). Team accent: 4px `--team` top stripe; initials badge in `--team` / `--team-foreground` with a `--team-secondary` ring | 2026-09-30 |
| UI7 | Until the workspace exists, `/teams/$teamId` is a placeholder (team name, "The workspace is coming next.", back link); unknown team IDs show not found | 2026-09-30 |
| UI8 | `Money` renders in `<data value>`; negatives show "−₹…" visually and a visually hidden "minus ₹…" for screen readers (`aria-label` is unreliable on non-interactive elements) | 2026-09-30 |
| UI9 | The shadcn `Button` includes the `touch-target` utility, so every button meets V6 on touch devices | 2026-09-30 |
| UI10 | Cards use the 8px radius (`rounded-lg`, V5) rather than shadcn's larger card default | 2026-09-30 |
| UI11 | Team colour on the active mobile tab uses `--team-indicator`: the primary colour if it reaches 3:1 on the page, otherwise the secondary, otherwise foreground (CSK → blue, RCB → red), plus bold text so state never relies on colour alone | 2026-09-30 |
| UI12 | Workspace layouts are rendered one at a time for the current breakpoint (`useViewport`), so each panel exists once and tab roles exist only on mobile. Desktop and tablet fill the viewport with panels scrolling independently; mobile scrolls the page | 2026-09-30 |
| UI13 | Mobile workspace opens on the Pool tab; the tab lives in `?tab=`, omitted for the default, invalid values fall back to Pool; tab changes replace the history entry | 2026-09-30 |
| UI14 | Switching team keeps all search params: pool filters, search, sort and the mobile tab carry over (the pool is the same for every team) | 2026-09-30 |
| UI15 | After a team switch, focus moves to the new team's title (announced by screen readers); Escape without switching returns focus to the switcher | 2026-09-30 |
| UI16 | Team switcher: shadcn DropdownMenu with a radio group (badge + full name per team, alphabetical, current checked, type-ahead); accessible name "Switch team, current: <team>" | 2026-09-30 |
| UI17 | Browser tab titles: "Choose a team · IPL Auction Planner", "<Team> · IPL Auction Planner", "Page not found · IPL Auction Planner" (`useDocumentTitle`) | 2026-09-30 |
| UI18 | Workspace header: 4px team stripe and 2px secondary line, "All teams" back link, badge + h1 + switcher (switcher wraps below the name on narrow screens), baseline figures via the shared `BaselineFigures`. While figures load, the team shows immediately and only the figures are skeletons | 2026-09-30 |
| UI19 | Tappable menu items and tab triggers include the `touch-target` utility, like buttons (UI9) | 2026-09-30 |
| S27 | `shared/color` is a shared-utilities boundary element (WCAG contrast) usable by `domain/` and `mock-server/` | 2026-09-30 |
