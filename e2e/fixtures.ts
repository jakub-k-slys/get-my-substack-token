import { test as base, expect } from "@playwright/test"
import { randomUUID } from "crypto"

const MOCK_SERVER_URL = "http://localhost:3001"

// Define fixture types
type TestFixtures = {
  testId: string
  resetMockState: () => Promise<void>
  configureMock: (config: Partial<{
    emailLoginShouldFail: boolean
    otpShouldFail: boolean
    mfaShouldFail: boolean
    mfaRequired: boolean
  }>) => Promise<void>
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
    await context.addCookies([{
      name: "x-test-id",
      value: testId,
      domain: "localhost",
      path: "/",
    }])
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

    const configure = async (config: Partial<{
      emailLoginShouldFail: boolean
      otpShouldFail: boolean
      mfaShouldFail: boolean
      mfaRequired: boolean
    }>) => {
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

export { expect }
