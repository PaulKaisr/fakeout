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
    // The heading renders the i18n key "game.question.image" or its translation
    // "Which image is AI-generated?" depending on the i18n state at render time
    await expect(
      page.getByRole("heading", {
        name: /Which image is AI-generated\?|game\.question\.image/,
      }),
    ).toBeVisible();

    // Verify that the theme is displayed
    // The theme label renders as "Theme:" (translated) or "game.theme:" (raw key)
    await expect(page.getByText(/Theme:|game\.theme/)).toBeVisible();

    // Verify that the instruction text is visible
    // Matches translated text or raw i18n key
    await expect(
      page.getByText(
        /Click on the image you think was created by Artificial Intelligence|game\.instructions\.image/,
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
