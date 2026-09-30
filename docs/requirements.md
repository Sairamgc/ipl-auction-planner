# IPL Auction Planner — v1 Requirements

Status: agreed, 29 Sep 2026. Changes to anything here are discussed first and logged in `docs/decisions.md`.

## 1. Product overview

A UI-only auction strategy tool. A franchise picks its team, reviews its squad baseline, and builds a plan of auction targets with expected prices that stays within purse and squad rules.

- **Users:** franchise strategy staff. One user can plan for several franchises; each franchise has its own plan.
- **Auction modelled:** a replay of the latest real IPL mini auction (for the 2026 season). Only one auction exists in the data.
- **Backend:** none in v1. A mock server (json-server plus a thin custom route layer) stands in for it and serves all seed data and saved plans.
- **Quality bar:** minimal features, production-grade engineering and UI.

## 2. Scope

**In v1**
- Team picker with a preview per franchise
- Team workspace per franchise, with an in-workspace team switcher
- Squad baseline (read-only): retained players, purse left, fixed squad rules
- Player pool (read-only): server-side search, filters, sort, infinite scroll
- Player detail dialog (read-only)
- Add-target dialog with expected price
- Target list: edit expected price inline, remove
- Summary metrics, warnings and note
- Rival purses (read-only)
- Autosave of plans
- Fully responsive layout, light mode only

**Out of v1**
- Multiple scenarios per franchise (v1 = one plan per franchise)
- Needs profile, what-if pricing, live auction mode, auto-suggest
- Editing the player pool
- Player photos (initials avatars instead)
- Previous IPL team field
- Dark mode
- Auth, real backend, Right-to-Match cards

**Stored now, used later**
- Real auction results live in a separate `auctionResults` resource that v1 never requests. Reserved for a future "plan vs reality" feature.

## 3. Screens and routes

| Route | Screen |
|---|---|
| `/` | Team picker. The app always opens here. |
| `/teams/$teamId` | Team workspace |

**Team picker:** one card per franchise showing logo (initials badge when there is no logo path or the image fails to load), purse before auction, open slots, open overseas slots, and plan status (not started, or number of targets). Clicking anywhere on a card opens the workspace. Cards are sorted alphabetically by franchise name; the figures sit under a "Before the auction" caption. Loading shows skeleton cards; any failed request shows one error with "Try again"; no franchises shows an empty state (UI1–UI7).

**Team workspace**
- Header: franchise name and logo, team switcher, purse before auction, open slots, open overseas slots, and an "All teams" link back to the picker. The browser tab reads "<Team> · IPL Auction Planner".
- Header and picker figures are the baseline after retentions, before any plan, and are labelled that way (e.g. "Purse before auction"). The plan's effect appears only in the summary panel.
- Player pool panel: search, filters, sort, infinite-scrolling table. Filters, search and sort live in the URL.
- My plan panel: retained players (locked) and targets grouped by role; within each role, highest expected price first. Expected price editable inline; targets removable.
- Summary panel: metrics, warnings, note, and rival purses at the bottom.

**Flows**
1. **View player details:** click a player row in the pool, or a retained player or target in the plan panel. Opens a read-only detail dialog.
2. **Add a target:** only from the Add button on a pool row. Opens the add dialog with expected price pre-filled with the base price. Confirming adds the target optimistically and autosaves.
3. **Edit a target's price:** inline in the plan panel. Saves on blur or Enter. An invalid value shows an error and is not saved until valid.
4. **Remove a target:** in the plan panel, saves immediately.
5. **Switch franchise:** header switcher (a menu of all teams, alphabetical, current team checked) navigates directly to another workspace. Search params carry over, so pool filters, search, sort and the mobile tab stay as they were. Focus moves to the new team's title.

**Detail dialog content:** name, age, nationality, overseas flag, role, batting hand, bowling style, capped status, base price (pool players).

- Layout: initials avatar, name (title) and role; then Age "25 (on 16 Dec 2025)", Nationality with an "Overseas" tag, Role, Batting ("Right-handed"), Bowling, Status (Capped / Uncapped), Base price. Closes with Close, Esc or a click outside; focus returns to the row that opened it. Not reflected in the URL (UI29).
- In a pool row, the player's name is the control that opens the dialog; the row's Add button (slice 3) sits beside it, never inside it. Until the add dialog exists, the Add button is not shown (UI30, UI34).

## 4. Responsive layout

| Screen | Width | Layout |
|---|---|---|
| Desktop | 1280px and up | Three panels: pool, plan, summary |
| Tablet | 768–1279px | Two columns (pool and plan); summary as a sticky strip that expands |
| Mobile | Below 768px | Tabs: Pool / Plan / Summary; sticky mini-summary bar (purse left, max safe bid, warning count). Active tab kept in the URL. |

On touch devices (tablets included), tappable elements are at least 44px (decision V6).

Team picker grid: 1 column (mobile), 2 (tablet), 4 (desktop) (UI2).

Workspace details (UI11–UI15):
- Desktop and tablet: the workspace fills the viewport under the header, and each panel scrolls on its own. Mobile: the page scrolls; the tabs stick under the header and the mini-summary bar is fixed to the bottom.
- Tablet: the summary strip sits along the bottom and expands upward.
- Mobile: the default tab is Pool; the tab is in the URL as `?tab=`, omitted for the default.
- Panels that scroll on their own are keyboard-focusable, so they can be scrolled with the keyboard in every browser, Safari included (UI20).
- Mobile: the mini-summary bar never covers content (the page reserves its exact height) and clears the iPhone safe area; the app uses `viewport-fit=cover` and pads for all safe-area insets (UI21).

## 5. Domain model

All money is stored as **whole lakh integers** (₹2.40 Cr = 240).

```ts
Auction      { id, name, season, auctionDate, rules: SquadRules }
SquadRules   { minSquadSize, maxSquadSize, maxOverseas, lowestBasePriceLakh }
Franchise    { id, name, shortName, logoPath?, purseRemainingLakh, colors: FranchiseColors }  // official pre-auction purse
FranchiseColors { primary, onPrimary, secondary, onSecondary }      // team accent + paired text colours (V10, V11)
Player       { id, name, dateOfBirth, nationality, role, battingHand, bowlingStyle, isCapped }
Retention    { franchiseId, playerId }
AuctionEntry { id, playerId, basePriceLakh }                          // a pool listing
AuctionResult{ auctionEntryId, status: 'sold' | 'unsold', franchiseId?, priceLakh? }  // not fetched in v1
Plan         { id /* = franchiseId */, franchiseId, targets: Target[], updatedAt }  // updatedAt: set by the server on each save; null until the first save
Target       { auctionEntryId, expectedPriceLakh }
```

**Enumerations**
- `nationality`: fixed list of cricket-nation codes with display names (e.g. `IND`, `AUS`, `ENG`, `WI`, `SA`, `NZ`, …). Final list set when compiling the data.
- `role`: Batter, Bowler, All-rounder, Wicketkeeper
- `battingHand`: Right, Left
- `bowlingStyle`: right-arm fast, right-arm medium, off-spin, leg-spin, left-arm fast, left-arm medium, left-arm orthodox, left-arm wrist spin, none

**Derived, never stored**
- Age: from date of birth, as of the auction date
- Overseas: nationality is not `IND`
- Squad count, overseas count, role breakdown (retained players included)
- Planned spend, max safe bid, warnings, note
- Picker preview: open slots, open overseas slots, plan status

**Rival purses** always show the official pre-auction purse. A plan never changes any franchise's displayed purse.

## 6. Plan rules

- One plan per franchise, seeded empty in the data (plan id = franchise id).
- Expected price is required, whole lakh only, pre-filled with the base price.
- Below base price: **blocked** at the input (add dialog and inline edit).
- Above the remaining purse: allowed, flagged by warnings.
- Plan-level rule breaks never block; they produce warnings.
- Autosave: add and remove save immediately; inline price edits save on blur or Enter. Saves are optimistic with rollback on failure and are sent one at a time in order, so an older save never overwrites a newer one. The client sends the plan without `updatedAt`; the server sets it. Latest wins: a failed save is rolled back only when no newer save is queued (the newer one carries the whole plan); rollback restores the last plan the server confirmed. When the latest save fails, the error offers "Try again", which resends the plan that failed.

## 7. Summary metrics, warnings and note

**Metrics**

| Metric | Definition |
|---|---|
| Spend vs purse | Sum of target expected prices against purse left |
| Squad count | Retained + targets, against min and max squad size |
| Overseas count | Retained + targets, against the overseas cap |
| Role breakdown | Count per role |
| Max safe bid | See formula below |

**Max safe bid**
```
remaining   = purseRemaining − plannedSpend
slotsToFill = max(0, minSquadSize − (squadCount + 1))   // +1 = the player being bid for
maxSafeBid  = remaining − slotsToFill × lowestBasePrice
```
If negative, display ₹0. A negative max safe bid always comes with a warning: warning 1 (over purse) or warning 4 (minimum squad unaffordable).

**Warnings**
1. Planned spend exceeds the purse
2. Squad count exceeds the maximum
3. Overseas count exceeds the cap
4. Not enough purse left to fill the minimum squad. Checked independently of max safe bid:
   ```
   slotsShort = max(0, minSquadSize − squadCount)
   warn when slotsShort > 0 and remaining < slotsShort × lowestBasePrice
   ```
   No warning once the minimum squad is met (an overspend is warning 1).

**Note (informational, not a warning)**
- Squad count is below the minimum squad size

## 8. API contract (mock server)

Resources in the database: `auction`, `franchises`, `players`, `retentions`, `auctionEntries`, `auctionResults`, `plans`.

| Request | Purpose |
|---|---|
| `GET /auction` | Rules, auction date |
| `GET /franchises` | Picker, switcher, rival purses |
| `GET /retentions` | Squad baselines, picker previews (joined with player data) |
| `GET /players` | Player details for retained players and plan targets |
| `GET /auctionEntries` | Static reference data: resolves plan targets to base price and player without another request |
| `GET /pool` | **Custom route.** Filtered, joined, sorted, paginated pool |
| `GET /plans` | Picker plan status |
| `GET /plans/:franchiseId` | Workspace plan |
| `PUT /plans/:franchiseId` | Autosave (whole plan without `updatedAt`; the server sets it and returns the saved plan) |

**`GET /pool`**
```
?search=&role=&overseas=&capped=&battingHand=&bowlingStyle=
&minBase=&maxBase=&sort=&order=&page=&pageSize=
→ { items: PoolRow[], total, page, pageSize }
```
- `PoolRow` = auction entry joined with player details.
- Filters: name search, role, overseas/Indian, capped/uncapped, batting hand, bowling style, base-price range.
- Role and bowling style are multi-select, sent comma-separated (`role=batter,bowler`). Values within a filter combine with OR; filters combine with AND.
- Sort: name, base price, age (age sorts by date of birth; youngest first = newest date of birth first).
- Default sort: base price, highest first. When `order` is omitted: base price descending, name A–Z, age youngest first.
- Tie-break: name, then id, so pages never repeat or skip rows.
- Page size: 25 (maximum 100).

Request/response shapes are Zod schemas in `shared/contracts`, used by both the mock server and the app.

**Mock server behaviour**
- Only the requests above are served. Every other write returns 405 with an `Allow` header; `GET /auctionResults` returns 404 (stored, not served in v1).
- `PUT /plans/:franchiseId` validates the body strictly against the plan contract, requires an existing franchise (404 otherwise) and a body id matching the URL (400 otherwise), then sets `updatedAt`.
- Invalid requests return 400 with `{ error, issues: [{ path, message }] }`.
- Search is case- and accent-insensitive. The tie-break (name, then id) is always ascending, whatever the chosen order.
- Dev-only simulation, off by default: `--delay <ms|min-max>` and `--fail-rate <0-1>` arguments to the mock server; `npm run dev:slow`, `dev:flaky`, `dev:chaos`.

## 9. Pool behaviour

- Server-side search, filtering, sorting and pagination.
- Search input debounced by 300 ms.
- Infinite scroll: auto-loads at the bottom, plus a "Load more" button for keyboard and screen-reader users.
- Changing filters or sort resets to the first page and scrolls the pool back to the top.
- The URL uses the API's own format: `/teams/csk?role=batter,bowler&overseas=false&sort=name`. Defaults are omitted; invalid values are ignored one by one; changes replace the history entry (UI24).
- Toolbar: search, a "Sort by" menu (base price, name or age, each both ways), and "Filters (n)", which opens a popover (tablet, desktop) or a bottom sheet (mobile). Filters apply immediately. Active filters show as removable chips with "Clear all" (the sort is kept) (UI26, UI27).
- Filters: role and bowling style (multi-select), nationality (any / Indian / overseas), status (any / capped / uncapped), batting hand, and base price "From" / "Up to" using the eight official base-price slabs (UI33).
- Rows: desktop table (player with Overseas / Uncapped tags, role, age, base price), tablet table (player with a "Bowler · AUS · 25" line, base price), mobile list. Clicking anywhere on a row opens the detail dialog (UI25, UI30) The current sort is announced with the table or list, e.g. "Players, sorted by name, Z to A" (UI35).
- States: skeleton rows on first load; previous results stay (dimmed, with "Updating results…" announced) while a new search or filter loads; "Loading more players…" for later pages; "No players match these filters." with "Clear filters"; a panel error with retry; a failed "Load more" keeps loaded rows and retries only the next page (UI28).
- "Load more" moves focus to the first newly loaded player and announces how many loaded (UI31).

## 10. Data

- Replay of the latest real mini auction (2026 season): franchises, official pre-auction purses, squad rules, retention lists.
- Pool: every player actually sold, plus unsold players with base price ₹1 Cr and above.
- All facts to be verified from reliable sources while compiling the seed data.
- `mock-server/db.seed.json` is committed; `db.json` is a git-ignored working copy restored by a reset script. The reset script validates the seed first and refuses an invalid one.
- All data is as of the auction date (16 Dec 2025); later changes are ignored. Sources, precedence and exceptions: `docs/data-sources.md`.
- Current seed: provisional starter (CSK and RCB, their retained squads, 21 pool players) until the full dataset is verified.

## 11. Formatting and assets

| Amount | Format | Example |
|---|---|---|
| ₹1 Cr and above | Crore, always 2 decimals | ₹2.40 Cr, ₹2.00 Cr |
| Below ₹1 Cr | Lakh, whole number | ₹75 L |
| Negative | Minus sign before the amount; screen readers hear "minus" | −₹1.20 Cr |

- Team logos: real logos, added by the project owner to `public/logos/`. No logo path, or the image fails to load → colour and initials badge. Franchise logos are trademarked: fine while private; revisit before any public deployment.
- Player images: none in v1; initials avatars.
- Theme: light mode only.
- Design tokens (decisions V1–V14):
  - Neutral base with a teal accent for buttons, links, focus rings and selected rows.
  - Team colours (`Franchise.colors`) appear only on the workspace header, team badge, active mobile tab and picker card accent; the secondary colour only as a thin stripe or border in the header and on the badge. Team colours are fills only, never body text; each has a paired text colour meeting WCAG AA.
  - Status colours: warnings amber, note blue, errors red, within limits green.
  - Font: Inter (self-hosted), tabular figures for all numbers. Radius 8px. Compact density, 14px base text.

## 12. Still to decide (during the build)

- Final list of nationality codes (from the compiled data)
