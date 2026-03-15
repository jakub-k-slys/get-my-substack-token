import { defineConfig, devices } from "@playwright/test"
import { defineBddConfig } from "playwright-bdd"

const E2E_APP_PORT = process.env.CI ? 3002 : 3000
const E2E_APP_COMMAND = process.env.CI
  ? `SUBSTACK_API_URL=http://localhost:3001/api/v1/ pnpm exec next dev --port ${E2E_APP_PORT}`
  : "SUBSTACK_API_URL=http://localhost:3001/api/v1/ pnpm dev"

const testDir = defineBddConfig({
  features: "e2e/features/**/*.feature",
  steps: ["e2e/steps/**/*.ts", "e2e/fixtures.ts"],
  outputDir: "e2e/.features-gen",
})

export default defineConfig({
  testDir,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${E2E_APP_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: E2E_APP_COMMAND,
    url: `http://localhost:${E2E_APP_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
