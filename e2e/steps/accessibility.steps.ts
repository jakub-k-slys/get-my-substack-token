import { When, Then, expect } from "../fixtures"

When("I focus the {string} element", async ({ page }, testId: string) => {
  await page.getByTestId(testId).focus()
})

When("I press Tab", async ({ page }) => {
  await page.keyboard.press("Tab")
})

Then("the {string} element should be focused", async ({ page }, testId: string) => {
  await expect(page.getByTestId(testId)).toBeFocused()
})

Then("the {string} element should be focusable", async ({ page }, testId: string) => {
  const element = page.getByTestId(testId)
  await element.focus()
  await expect(element).toBeFocused()
})
