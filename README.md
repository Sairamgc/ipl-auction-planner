# IPL Auction Planner

A planning tool for IPL franchises: pick a team and plan who to target at the auction, within its purse and the squad rules. It replays the latest IPL mini auction, the **IPL 2026 Player Auction** (16 Dec 2025, Abu Dhabi), with real data:
- all 10 franchises and their official pre-auction purses;
- their 173 retained players;
- a 98-player auction pool.

The app runs entirely on your machine. A small mock server stands in for the backend and saves your plans locally.

## Prerequisites

- **Node.js 24 or later** (`.nvmrc` pins `24`). The easiest way to get it is [nvm](https://github.com/nvm-sh/nvm) on macOS and Linux, or [nvm-windows](https://github.com/coreybutler/nvm-windows) on Windows:
  ```sh
  nvm install 24
  nvm use 24
  ```
  Or download it from [nodejs.org](https://nodejs.org/). npm comes with Node.
- **Git**, to clone the repository:
  ```sh
  git clone https://github.com/Sairamgc/ipl-auction-planner.git
  cd ipl-auction-planner
  ```

## Set up and run

```sh
npm install
npm run dev
```

Open **<http://localhost:5173>**.

`npm run dev` starts the app (Vite, port 5173) and the mock server (json-server 0.17.4, port 3001). The app talks to the mock server through Vite's `/api` proxy, so you only need the one URL. The first run creates the local database from the seed data.

### Slow and flaky modes

| Command | Simulates |
|---|---|
| `npm run dev:slow` | Every request takes 300–1200 ms |
| `npm run dev:flaky` | 20% of requests fail |
| `npm run dev:chaos` | Both |

### Reset the data

Your plans are saved in `mock-server/db.json` (not committed). To start again from the original data, stop the app, then run:

```sh
npm run db:reset
npm run dev
```

## Checks and tests

| Command | Runs |
|---|---|
| `npm run check` | Typecheck, lint, format check, and unit tests with coverage |
| `npm test` | Unit and component tests only (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) in desktop Chromium, mobile Chromium and desktop WebKit, including automated accessibility checks |

Before the first `npm run test:e2e`, install the browsers:

```sh
npx playwright install chromium webkit
```

The E2E run starts its own servers and resets the data, so stop `npm run dev` first.

## Troubleshooting

- **Port 5173 already in use.** Vite picks the next free port (e.g. 5174) and prints the URL in the terminal; open that one.
- **Port 3001 already in use.** The mock server stops with `EADDRINUSE` and the app shows "Couldn't load" errors. Usually an earlier `npm run dev` is still running: stop it, or find what holds the port and end it:
  - macOS/Linux: `lsof -i :3001`, then `kill <PID>`
  - Windows: `netstat -ano | findstr :3001`, then `taskkill /PID <PID> /F`
- **Wrong Node version** (install or start errors). Check with `node -v`; it must be 24 or later. With nvm, run `nvm use` in the project folder (it reads `.nvmrc`); with nvm-windows, run `nvm use 24`.
- **Data looks odd** (old plans, missing players after pulling new data). Stop the app, run `npm run db:reset`, then `npm run dev` again.
- **Stopping the app.** Press `Ctrl+C` in the terminal running `npm run dev`. It stops both the app and the mock server.

## A short tour

1. **Team picker.** All 10 franchises, with their purse, open slots and plan status. Pick one.
2. **Workspace** for that team, with three panels (tabs on a phone):
   - **Player pool:** search, filter and sort the 98 auction players. Open a player for details, or **Add** them to your plan at an expected price.
   - **My plan:** your retained players (locked) and your targets, grouped by role. Edit prices inline, or remove a target (with undo). Plans save automatically.
   - **Summary:** purse left, max safe bid, squad, overseas and role counts, warnings when you break a rule, and the other teams' purses.
3. **Switch team** from the header, or go back to **All teams**.

Filters, search and the mobile tab live in the URL, so a reload or a shared link keeps them.

## Project structure

```
src/            React app: routes, features (team-picker, workspace, player-pool,
                player-detail, add-target, plan, summary), api, domain rules
mock-server/    json-server mock API and the seed data (db.seed.json)
shared/         Zod contracts and helpers shared by the app and the mock server
e2e/            Playwright tests
docs/           requirements, decisions, data sources
```

Stack: React 19, TypeScript 6, Vite 8, TanStack Router and Query, Tailwind CSS 4, shadcn/ui, Zod, Vitest and Playwright.

More detail:
- [`docs/requirements.md`](docs/requirements.md): what the app does
- [`docs/decisions.md`](docs/decisions.md): the decision log
- [`docs/data-sources.md`](docs/data-sources.md): where the data comes from, and its exceptions
- [`CLAUDE.md`](CLAUDE.md): commands, conventions and architecture rules

## Known limitations

- **Local only.** There's no real backend or login. Plans live in `mock-server/db.json` on your machine.
- **No team logos.** Team logos are trademarks, so teams show an initials badge in their colours instead, by design.
- **Data scope.** The pool covers only players who were sold, plus those called and left unsold with a base price of ₹1 Cr or more. Other listed players aren't included. All data is as of the auction day (16 Dec 2025).
- **Light mode only.**

## About this project

This is a personal, non-commercial project. IPL, the team names, colours and logos belong to their respective owners, and this project is not affiliated with or endorsed by them.

The code is released under the [MIT License](LICENSE). The licence covers the code only. It does not cover the IPL or team names and colours, or the auction data compiled from public sources (see [`docs/data-sources.md`](docs/data-sources.md)).
