import { expect, test } from "@playwright/test";

test("the ValueIt home page opens", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("ValueIt");
  await expect(
    page.getByRole("heading", { level: 1, name: "ValueIt", exact: true }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("font-family", /Inter Variable/);
});
