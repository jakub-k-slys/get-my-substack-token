import { When, Then, expect } from "../fixtures"

When("I enter the verification code {string}", async ({ page }, code: string) => {
  const digits = code.split("")
  for (let i = 0; i < digits.length; i++) {
    await page.getByTestId(`code-input-${i}`).fill(digits[i])
  }
})

When("I enter {int} digits of the verification code", async ({ page }, count: number) => {
  for (let i = 0; i < count; i++) {
    await page.getByTestId(`code-input-${i}`).fill(String(i + 1))
  }
})

When("I type {string} in the first verification input", async ({ page }, digit: string) => {
  await page.getByTestId("code-input-0").focus()
  await page.getByTestId("code-input-0").fill(digit)
})

Then("I should see my email displayed as {string}", async ({ page }, email: string) => {
  await expect(page.getByTestId("email-display")).toContainText(email)
})

Then("the verification code input {int} should be focused", async ({ page }, index: number) => {
  await expect(page.getByTestId(`code-input-${index}`)).toBeFocused()
})

Then("the continue button should be disabled", async ({ page }) => {
  await expect(page.getByTestId("continue-button")).toBeDisabled()
})

Then("the continue button should be enabled", async ({ page }) => {
  await expect(page.getByTestId("continue-button")).toBeEnabled()
})

Then("I should stay on the verification step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue")
})
