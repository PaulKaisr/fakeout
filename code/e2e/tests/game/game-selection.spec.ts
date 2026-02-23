// spec: Game Flow
// seed: code/e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Game Flow", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all localStorage and cookies to ensure a fresh state
    await context.clearCookies();
    await page.goto("http://localhost:3000/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should update round and score after selection", async ({ page }) => {
    // Navigate to image game page (more reliable than video)
    await page.goto("http://localhost:3000/en/image");

    // Wait for game to fully load - the A/B cards should be visible
    await expect(page.locator("main").getByText("A", { exact: true })).toBeVisible({
      timeout: 15000,
    });

    // Check initial round counter shows "1/5" (image mode has 5 rounds)
    await expect(page.getByText(/1\/\d/)).toBeVisible();

    // Check initial score display is visible
    // The stat box label is hardcoded as "SCORE" in the template
    await expect(page.getByText("SCORE")).toBeVisible();

    // Click on option A (one of the game cards)
    await page.locator("main").getByText("A", { exact: true }).click();

    // Wait for feedback - "Next Round" button should appear
    // The button text renders as "Next Round" (translated) or "game.nextRound" (raw key)
    await expect(
      page.getByRole("button", { name: /Next Round|game\.nextRound/ })
    ).toBeVisible({ timeout: 10000 });

    // Click Next Round to proceed
    await page.getByRole("button", { name: /Next Round|game\.nextRound/ }).click();

    // Wait for round counter to update to 2/5
    await expect(page.getByText(/2\/\d/)).toBeVisible({ timeout: 10000 });

    // Score should still be visible
    await expect(page.getByText("SCORE")).toBeVisible();
  });
});
