import { test } from "@playwright/test";

test("seed", async ({ page }) => {
  // Navigate to the home page to set up the page context for agents
  await page.goto("http://localhost:3000/");
});
