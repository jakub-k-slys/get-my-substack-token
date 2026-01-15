import { test, expect } from "@playwright/test"

const MOCK_SERVER_URL = "http://localhost:3001"

test.describe("Auth Flow - Complete Flow with Mock Server", () => {
  test.beforeEach(async ({ request }) => {
    // Reset mock server state before each test
    await request.post(`${MOCK_SERVER_URL}/api/v1/__reset`)
  })

  test("should complete full auth flow: email -> verification -> 2FA -> token", async ({ page }) => {
    await page.goto("/")

    // Step 1: Email
    await expect(page.getByRole("heading", { name: "Sign in to Substack" })).toBeVisible()
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    // Step 2: Verification - wait for the verification step to appear
    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    await expect(page.getByText("test@example.com")).toBeVisible()

    // Fill in the 6-digit verification code
    const codeInputs = page.locator('input[id^="code-"]')
    await codeInputs.nth(0).fill("1")
    await codeInputs.nth(1).fill("2")
    await codeInputs.nth(2).fill("3")
    await codeInputs.nth(3).fill("4")
    await codeInputs.nth(4).fill("5")
    await codeInputs.nth(5).fill("6")

    await page.getByRole("button", { name: "Continue" }).click()

    // Step 3: Two-Factor Authentication
    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByPlaceholder("Type your 6-digit code here...").fill("123456")
    await page.getByRole("button", { name: "Confirm" }).click()

    // Step 4: Token Display
    await expect(page.getByRole("heading", { name: "Your Substack Token" })).toBeVisible()
    await expect(page.getByText("Your authentication token has been generated")).toBeVisible()
    await expect(page.getByRole("button", { name: "Copy Token" })).toBeVisible()
  })

  test("should allow skipping 2FA step", async ({ page }) => {
    await page.goto("/")

    // Email step
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    // Verification step
    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    // Two-Factor step - click skip
    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByRole("button", { name: /Skip.*2FA/i }).click()

    // Should go directly to token display
    await expect(page.getByRole("heading", { name: "Your Substack Token" })).toBeVisible()
  })

  test("should show token and allow copying", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    await page.goto("/")

    // Complete flow quickly
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByRole("button", { name: /Skip.*2FA/i }).click()

    // Token display step
    await expect(page.getByRole("heading", { name: "Your Substack Token" })).toBeVisible()

    // Test copy button
    await page.getByRole("button", { name: "Copy Token" }).click()
    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible()

    // Button should revert back after 2 seconds
    await expect(page.getByRole("button", { name: "Copy Token" })).toBeVisible({ timeout: 3000 })
  })

  test("should allow starting over from token display", async ({ page }) => {
    await page.goto("/")

    // Complete flow
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByRole("button", { name: /Skip.*2FA/i }).click()

    // Token display
    await expect(page.getByRole("heading", { name: "Your Substack Token" })).toBeVisible()

    // Click start over
    await page.getByRole("button", { name: "Start Over" }).click()

    // Should be back at email step
    await expect(page.getByRole("heading", { name: "Sign in to Substack" })).toBeVisible()
    await expect(page.getByPlaceholder("Your email")).toBeVisible()
  })

  test("should toggle token visibility", async ({ page }) => {
    await page.goto("/")

    // Complete flow to token step
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByRole("button", { name: /Skip.*2FA/i }).click()

    // Token display
    await expect(page.getByRole("heading", { name: "Your Substack Token" })).toBeVisible()

    // Token should be hidden by default (password type)
    const tokenInput = page.locator("input[readonly]")
    await expect(tokenInput).toHaveAttribute("type", "password")

    // Click eye icon to show token
    await page.locator("button").filter({ has: page.locator("svg") }).first().click()

    // Token should now be visible (text type)
    await expect(tokenInput).toHaveAttribute("type", "text")
  })
})

test.describe("Auth Flow - Error Handling with Mock Server", () => {
  test.beforeEach(async ({ request }) => {
    // Reset mock server state before each test
    await request.post(`${MOCK_SERVER_URL}/api/v1/__reset`)
  })

  test("should handle email login error", async ({ page, request }) => {
    // Configure mock to fail email login
    await request.post(`${MOCK_SERVER_URL}/api/v1/__config`, {
      data: { emailLoginShouldFail: true },
    })

    await page.goto("/")
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    // Should show error and stay on email step
    await expect(page.getByText(/invalid|failed|error/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole("heading", { name: "Sign in to Substack" })).toBeVisible()
  })

  test("should handle OTP verification error", async ({ page, request }) => {
    // Configure mock to fail OTP verification
    await request.post(`${MOCK_SERVER_URL}/api/v1/__config`, {
      data: { otpShouldFail: true },
    })

    await page.goto("/")

    // Complete email step
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    // Verification step
    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    // Should show error and stay on verification step
    await expect(page.getByText(/failed|error|incorrect/i)).toBeVisible({ timeout: 10000 })
  })

  test("should handle MFA verification error", async ({ page, request }) => {
    // Configure mock to fail MFA verification
    await request.post(`${MOCK_SERVER_URL}/api/v1/__config`, {
      data: { mfaShouldFail: true },
    })

    await page.goto("/")

    // Complete email step
    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    // Complete verification step
    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()
    const codeInputs = page.locator('input[id^="code-"]')
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await page.getByRole("button", { name: "Continue" }).click()

    // MFA step
    await expect(page.getByRole("heading", { name: "Two-factor authentication" })).toBeVisible()
    await page.getByPlaceholder("Type your 6-digit code here...").fill("123456")
    await page.getByRole("button", { name: "Confirm" }).click()

    // Should show error and stay on MFA step
    await expect(page.getByText(/failed|error|incorrect/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe("Auth Flow - Verification Step Details", () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_SERVER_URL}/api/v1/__reset`)
  })

  test("should auto-focus next input when entering verification code", async ({ page }) => {
    await page.goto("/")

    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()

    // Type in first input and verify focus moves
    const codeInputs = page.locator('input[id^="code-"]')
    await codeInputs.nth(0).focus()
    await codeInputs.nth(0).fill("1")

    // Second input should be focused
    await expect(codeInputs.nth(1)).toBeFocused()
  })

  test("should disable continue button until all 6 digits entered", async ({ page }) => {
    await page.goto("/")

    await page.getByPlaceholder("Your email").fill("test@example.com")
    await page.getByRole("button", { name: "Continue" }).click()

    await expect(page.getByRole("heading", { name: "Check your email to continue" })).toBeVisible()

    const continueButton = page.getByRole("button", { name: "Continue" })
    const codeInputs = page.locator('input[id^="code-"]')

    // Button should be disabled initially
    await expect(continueButton).toBeDisabled()

    // Fill 5 digits - should still be disabled
    for (let i = 0; i < 5; i++) {
      await codeInputs.nth(i).fill(String(i + 1))
    }
    await expect(continueButton).toBeDisabled()

    // Fill last digit - should be enabled
    await codeInputs.nth(5).fill("6")
    await expect(continueButton).toBeEnabled()
  })
})
