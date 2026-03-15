import { Given, When, Then, expect } from "../fixtures"

Given("I am on the sign in page", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
})

When("I enter the email {string}", async ({ page }, email: string) => {
  const emailInput = page.getByTestId("email-input")
  await emailInput.click()
  await emailInput.clear()
  await emailInput.pressSequentially(email)
  await expect(emailInput).toHaveValue(email)
})

When("I click the continue button", async ({ page }) => {
  await page.getByTestId("continue-button").click()
})

When("I press Enter on the email input", async ({ page }) => {
  await page.getByTestId("email-input").press("Enter")
})

When("I submit the form without entering an email", async ({ page }) => {
  await page.getByTestId("continue-button").click()
})

Then("I should see the email validation error {string}", async ({ page }, message: string) => {
  await expect(page.getByTestId("email-error")).toContainText(message)
})

Then("I should see an email validation error", async ({ page }) => {
  await expect(page.getByTestId("email-error")).toBeVisible()
})

Then("the email input should have type {string}", async ({ page }, type: string) => {
  await expect(page.getByTestId("email-input")).toHaveAttribute("type", type)
})

Then("the email input should indicate invalid state", async ({ page }) => {
  await expect(page.getByTestId("email-input")).toHaveAttribute("aria-invalid", "true")
})

Then("I should proceed to the verification step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Check your email to continue", { timeout: 10000 })
})

Then("the continue button should show {string}", async ({ page }, text: string) => {
  await expect(page.getByTestId("continue-button")).toHaveText(text)
})

Then("I should stay on the email step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Sign in to Substack")
})
