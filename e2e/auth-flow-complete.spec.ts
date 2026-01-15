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
    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Step 2: Verification - wait for the verification step to appear
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    await expect(page.getByTestId("email-display")).toHaveText("test@example.com")

    // Fill in the 6-digit verification code
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }

    await page.getByTestId("continue-button").click()

    // Step 3: Two-Factor Authentication
    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("mfa-input").fill("123456")
    await page.getByTestId("confirm-button").click()

    // Step 4: Token Display
    await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token")
    await expect(page.getByTestId("token-message")).toBeVisible()
    await expect(page.getByTestId("copy-token-button")).toBeVisible()
  })

  test("should allow skipping 2FA step", async ({ page }) => {
    await page.goto("/")

    // Email step
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Verification step
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    // Two-Factor step - click skip
    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("skip-2fa-button").click()

    // Should go directly to token display
    await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token")
  })

  test("should show token and allow copying", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    await page.goto("/")

    // Complete flow quickly
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("skip-2fa-button").click()

    // Token display step
    await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token")

    // Test copy button
    await page.getByTestId("copy-token-button").click()
    await expect(page.getByTestId("copy-token-button")).toHaveText("Copied!")

    // Button should revert back after 2 seconds
    await expect(page.getByTestId("copy-token-button")).toHaveText("Copy Token", { timeout: 3000 })
  })

  test("should allow starting over from token display", async ({ page }) => {
    await page.goto("/")

    // Complete flow
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("skip-2fa-button").click()

    // Token display
    await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token")

    // Click start over
    await page.getByTestId("start-over-button").click()

    // Should be back at email step
    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await expect(page.getByTestId("email-input")).toBeVisible()
  })

  test("should toggle token visibility", async ({ page }) => {
    await page.goto("/")

    // Complete flow to token step
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("skip-2fa-button").click()

    // Token display
    await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token")

    // Token should be hidden by default (password type)
    await expect(page.getByTestId("token-input")).toHaveAttribute("type", "password")

    // Click eye icon to show token
    await page.getByTestId("toggle-visibility-button").click()

    // Token should now be visible (text type)
    await expect(page.getByTestId("token-input")).toHaveAttribute("type", "text")
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
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Should show error and stay on email step
    await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
  })

  test("should handle OTP verification error", async ({ page, request }) => {
    // Configure mock to fail OTP verification
    await request.post(`${MOCK_SERVER_URL}/api/v1/__config`, {
      data: { otpShouldFail: true },
    })

    await page.goto("/")

    // Complete email step
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Verification step
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    // Should show error and stay on verification step
    await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 })
  })

  test("should handle MFA verification error", async ({ page, request }) => {
    // Configure mock to fail MFA verification
    await request.post(`${MOCK_SERVER_URL}/api/v1/__config`, {
      data: { mfaShouldFail: true },
    })

    await page.goto("/")

    // Complete email step
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Complete verification step
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await page.getByTestId("continue-button").click()

    // MFA step
    await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
    await page.getByTestId("mfa-input").fill("123456")
    await page.getByTestId("confirm-button").click()

    // Should show error and stay on MFA step
    await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 })
  })
})

test.describe("Auth Flow - Verification Step Details", () => {
  test.beforeEach(async ({ request }) => {
    await request.post(`${MOCK_SERVER_URL}/api/v1/__reset`)
  })

  test("should auto-focus next input when entering verification code", async ({ page }) => {
    await page.goto("/")

    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")

    // Type in first input and verify focus moves
    await page.getByTestId("code-input-0").focus()
    await page.getByTestId("code-input-0").fill("1")

    // Second input should be focused
    await expect(page.getByTestId("code-input-1")).toBeFocused()
  })

  test("should disable continue button until all 6 digits entered", async ({ page }) => {
    await page.goto("/")

    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")

    const continueButton = page.getByTestId("continue-button")

    // Button should be disabled initially
    await expect(continueButton).toBeDisabled()

    // Fill 5 digits - should still be disabled
    for (let i = 0; i < 5; i++) {
      await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
    }
    await expect(continueButton).toBeDisabled()

    // Fill last digit - should be enabled
    await page.getByTestId("code-input-5").fill("6")
    await expect(continueButton).toBeEnabled()
  })
})
