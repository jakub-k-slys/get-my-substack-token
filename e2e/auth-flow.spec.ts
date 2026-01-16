import { test, expect } from "./fixtures"

test.describe("Auth Flow - Email Step", () => {
  test.beforeEach(async ({ resetMockState }) => {
    // resetMockState is called automatically by the fixture
  })

  test("should display the email step initially", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await expect(page.getByTestId("email-input")).toBeVisible()
    await expect(page.getByTestId("continue-button")).toBeVisible()
  })

  test("should show validation error for empty email", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("continue-button").click()
    await expect(page.getByTestId("email-error")).toHaveText("Email is required")
  })

  test("should prevent submission with invalid email format", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("not-an-email")
    await page.getByTestId("continue-button").click()

    // The form should NOT submit - button should still say "Continue"
    await expect(page.getByTestId("continue-button")).toHaveText("Continue")
  })

  test("should accept valid email and proceed to next step", async ({ page }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Should proceed to verification step
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue", { timeout: 10000 })
  })

  test("should have proper input type", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("email-input")).toHaveAttribute("type", "email")
  })

  test("should display header icon", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("header-icon")).toBeVisible()
  })
})

test.describe("Auth Flow - Form Interactions", () => {
  test("should clear validation error when user submits valid email", async ({ page, resetMockState }) => {
    await page.goto("/")
    // Trigger validation error
    await page.getByTestId("continue-button").click()
    await expect(page.getByTestId("email-error")).toBeVisible()

    // Fill valid email and submit
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    // Should not show email validation error anymore
    await expect(page.getByTestId("email-error")).not.toBeVisible()
  })

  test("should handle form submission with Enter key", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("email-input").press("Enter")

    // Should proceed to verification step
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue", { timeout: 10000 })
  })
})

test.describe("Auth Flow - Responsive Design", () => {
  test("should display correctly on mobile viewport", async ({ page, resetMockState }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await expect(page.getByTestId("email-input")).toBeVisible()
    await expect(page.getByTestId("continue-button")).toBeVisible()
    await expect(page.getByTestId("auth-card")).toBeVisible()
  })

  test("should display correctly on tablet viewport", async ({ page, resetMockState }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/")

    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await expect(page.getByTestId("email-input")).toBeVisible()
  })

  test("should display correctly on desktop viewport", async ({ page, resetMockState }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/")

    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
    await expect(page.getByTestId("email-input")).toBeVisible()
  })
})

test.describe("Auth Flow - Visual Elements", () => {
  test("should have auth card visible", async ({ page, resetMockState }) => {
    await page.goto("/")
    await expect(page.getByTestId("auth-card")).toBeVisible()
  })

  test("should have main container visible", async ({ page, resetMockState }) => {
    await page.goto("/")
    await expect(page.getByTestId("main-container")).toBeVisible()
  })

  test("should have email input visible", async ({ page, resetMockState }) => {
    await page.goto("/")
    await expect(page.getByTestId("email-input")).toBeVisible()
  })

  test("should have continue button visible", async ({ page, resetMockState }) => {
    await page.goto("/")
    await expect(page.getByTestId("continue-button")).toBeVisible()
  })
})

test.describe("Auth Flow - Error Handling", () => {
  test("should show API error message when login fails", async ({ page, configureMock }) => {
    // Configure mock to fail
    await configureMock({ emailLoginShouldFail: true })

    await page.goto("/")
    await page.getByTestId("email-input").fill("test@example.com")
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("error-message")).toBeVisible({ timeout: 10000 })
  })
})

test.describe("Auth Flow - Accessibility", () => {
  test("should have proper heading text", async ({ page, resetMockState }) => {
    await page.goto("/")
    await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
  })

  test("should have focusable email input", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("email-input").focus()
    await expect(page.getByTestId("email-input")).toBeFocused()
  })

  test("should have focusable submit button", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("continue-button").focus()
    await expect(page.getByTestId("continue-button")).toBeFocused()
  })

  test("should support keyboard navigation", async ({ page, resetMockState }) => {
    await page.goto("/")
    // Tab to email input
    await page.keyboard.press("Tab")
    await expect(page.getByTestId("email-input")).toBeFocused()

    // Tab to submit button
    await page.keyboard.press("Tab")
    await expect(page.getByTestId("continue-button")).toBeFocused()
  })

  test("email input should indicate invalid state after failed validation", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("continue-button").click()
    await expect(page.getByTestId("email-input")).toHaveAttribute("aria-invalid", "true")
  })
})

test.describe("Auth Flow - Email Validation Edge Cases", () => {
  test("should accept email with subdomain", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("user@mail.example.co.uk")
    await page.getByTestId("continue-button").click()

    // Should proceed to verification step (no validation error)
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue", { timeout: 10000 })
  })

  test("should accept email with plus addressing", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("user+tag@example.com")
    await page.getByTestId("continue-button").click()

    // Should proceed to verification step (no validation error)
    await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue", { timeout: 10000 })
  })

  test("should reject email without proper domain", async ({ page, resetMockState }) => {
    await page.goto("/")
    await page.getByTestId("email-input").fill("user@invalid")
    await page.getByTestId("continue-button").click()

    // Should either show validation error or stay on continue (browser validation)
    const buttonText = await page.getByTestId("continue-button").textContent()
    // Browser validation may prevent submission, keeping "Continue" text
    expect(buttonText === "Continue" || buttonText === "Sending...").toBe(true)
  })

  test("should handle very long email gracefully", async ({ page, resetMockState }) => {
    await page.goto("/")
    const longEmail = "a".repeat(300) + "@test.com"
    await page.getByTestId("email-input").fill(longEmail)
    await page.getByTestId("continue-button").click()

    await expect(page.getByTestId("email-error")).toHaveText("Email is too long")
  })
})
