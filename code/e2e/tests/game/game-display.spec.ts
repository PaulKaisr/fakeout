// spec: Game Flow
// seed: code/e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Game Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage and cookies before test
    await context.clearCookies();
    await page.goto("http://localhost:3000/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should display game with two options", async ({ page }) => {
    // Navigate to image game page (more reliable than video)
    await page.goto("http://localhost:3000/en/image");

    // Wait for game to fully load - the A/B cards should be visible
    await expect(
      page.locator("main").getByText("A", { exact: true }),
    ).toBeVisible({
      timeout: 15000,
    });

    // Verify that the game heading is visible
    await expect(
      page.getByRole("heading", { name: "Which image is AI-generated?" }),
    ).toBeVisible();

    // Verify that the theme is displayed
    await expect(page.getByText(/Theme:/)).toBeVisible();

    // Verify that the instruction text is visible
    await expect(
      page.getByText(
        "Click on the image you think was created by Artificial Intelligence",
      ),
    ).toBeVisible();

    // Verify that option A card is displayed
    await expect(
      page.locator("main").getByText("A", { exact: true }),
    ).toBeVisible();

    // Verify that option B card is displayed
    await expect(
      page.locator("main").getByText("B", { exact: true }),
    ).toBeVisible();
  });
});
