import { Given, When, Then, expect } from "../fixtures"

Given("I am on the home page", async ({ page }) => {
  await page.goto("/")
})

Given("clipboard permissions are granted", async ({ context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
})

Given("I am on the {string} page", async ({ page }, path: string) => {
  await page.goto(path)
})

When("I set the viewport to {int}x{int}", async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height })
})

Then("the page title should be {string}", async ({ page }, title: string) => {
  await expect(page.getByTestId("step-title")).toHaveText(title)
})

Then("the {string} element should be visible", async ({ page }, testId: string) => {
  await expect(page.getByTestId(testId)).toBeVisible()
})

Then("the {string} element should not be visible", async ({ page }, testId: string) => {
  await expect(page.getByTestId(testId)).not.toBeVisible()
})

Then("the {string} element should be hidden", async ({ page }, testId: string) => {
  await expect(page.getByTestId(testId)).toBeHidden()
})
