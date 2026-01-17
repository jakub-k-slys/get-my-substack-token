import { test as base, createBdd } from "playwright-bdd"
import { expect } from "@playwright/test"
import { randomUUID } from "crypto"

const MOCK_SERVER_URL = "http://localhost:3001"

// Define fixture types
export type MockConfig = {
  emailLoginShouldFail?: boolean
  otpShouldFail?: boolean
  mfaShouldFail?: boolean
  mfaRequired?: boolean
}

type TestFixtures = {
  testId: string
  resetMockState: () => Promise<void>
  configureMock: (config: MockConfig) => Promise<void>
}

// Create extended test with fixtures
export const test = base.extend<TestFixtures>({
  // Generate unique test ID for state isolation
  testId: async ({}, use) => {
    const id = randomUUID()
    await use(id)
  },

  // Set test ID cookie on the page context for state isolation
  context: async ({ context, testId }, use) => {
    await context.addCookies([
      {
        name: "x-test-id",
        value: testId,
        domain: "localhost",
        path: "/",
      },
    ])
    await use(context)
  },

  // Reset mock state before each test
  resetMockState: async ({ testId }, use) => {
    const reset = async () => {
      await fetch(`${MOCK_SERVER_URL}/api/v1/__reset`, {
        method: "POST",
        headers: { "x-test-id": testId },
      })
    }
    await reset()
    await use(reset)
  },

  // Configure mock behavior for this test
  configureMock: async ({ testId }, use) => {
    // Reset state first
    await fetch(`${MOCK_SERVER_URL}/api/v1/__reset`, {
      method: "POST",
      headers: { "x-test-id": testId },
    })

    const configure = async (config: MockConfig) => {
      await fetch(`${MOCK_SERVER_URL}/api/v1/__config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-test-id": testId,
        },
        body: JSON.stringify(config),
      })
    }
    await use(configure)
  },
})

// Export BDD functions bound to our custom fixtures
export const { Given, When, Then, Before, After } = createBdd(test)
export { expect }
