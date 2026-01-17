import { When, Then, expect } from "../fixtures"

When("I enter the 2FA code {string}", async ({ page }, code: string) => {
  await page.getByTestId("mfa-input").fill(code)
})

When("I click the confirm button", async ({ page }) => {
  await page.getByTestId("confirm-button").click()
})

When("I click the skip 2FA button", async ({ page }) => {
  await page.getByTestId("skip-2fa-button").click()
})

Then("I should be on the two-factor authentication step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication", { timeout: 10000 })
})

Then("I should stay on the two-factor authentication step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Two-factor authentication")
})
