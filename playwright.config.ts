import { defineConfig, devices } from "@playwright/test";

const APP_URL = "http://localhost:5173";
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // One shared mock server and database: tests that save plans must not
  // run alongside tests that read them (S31)
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "github" : "list",
  use: {
    baseURL: APP_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Chromium-based, so a single browser download covers both projects
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      name: "Mock server",
      // Start every run from the seed data
      command: "npm run db:reset && npm run start:mock",
      url: "http://localhost:3001/api/auction",
      reuseExistingServer: !isCI,
    },
    {
      name: "App",
      command: "npm run dev:app",
      url: APP_URL,
      reuseExistingServer: !isCI,
    },
  ],
});
