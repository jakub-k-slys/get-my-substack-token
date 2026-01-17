import { When, Then, expect } from "../fixtures"

Then("I should be on the token display step", async ({ page }) => {
  await expect(page.getByTestId("step-title")).toHaveText("Your Substack Token", { timeout: 10000 })
})

Then("I should see the token message", async ({ page }) => {
  await expect(page.getByTestId("token-message")).toBeVisible()
})

Then("I should see the copy token button", async ({ page }) => {
  await expect(page.getByTestId("copy-token-button")).toBeVisible()
})

When("I click the copy token button", async ({ page }) => {
  await page.getByTestId("copy-token-button").click()
})

Then("the copy button should show {string}", async ({ page }, text: string) => {
  await expect(page.getByTestId("copy-token-button")).toContainText(text)
})

When("I click the toggle visibility button", async ({ page }) => {
  await page.getByTestId("toggle-visibility-button").click()
})

Then("the token input should have type {string}", async ({ page }, type: string) => {
  await expect(page.getByTestId("token-input")).toHaveAttribute("type", type)
})

When("I click the start over button", async ({ page }) => {
  await page.getByTestId("start-over-button").click()
})
