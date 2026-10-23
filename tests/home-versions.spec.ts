import { expect, test } from "@playwright/test";

test("home versions navigate between the original and both alternatives", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  for (const [label, path, title] of [
    ["Home 2", "/home2", "BIG PLANS. FRESH STARTS."],
    ["Home 3", "/home3", "A fresh place to call home."],
    ["Home 1", "/", "A FRESH SLICE OF HOME."],
  ]) {
    await page.getByText("Home versions", { exact: true }).click();
    await page.getByRole("link", { name: new RegExp(`^${label}`) }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1")).toHaveText(title, { useInnerText: true });
    await page.getByText("Home versions", { exact: true }).click();
    await expect(page.getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(page.locator("details[open]")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

for (const version of [2, 3]) {
  test(`home${version} has working listings, local links and responsive navigation`, async ({ page }) => {
    await page.goto(`/home${version}`);
    const cta = page.getByRole("link", { name: version === 2 ? "Find your next home" : "Explore homes", exact: true }).first();
    await cta.click();
    await expect(page).toHaveURL(new RegExp(`/home${version}#mellon-properties$`));
    await page.getByRole("button", { name: "For sale", exact: true }).click();
    await expect(page.getByRole("button", { name: "For sale", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("searchbox", { name: "Search homes" }).fill("Shafter");
    await expect(page.getByRole("searchbox", { name: "Search homes" })).toHaveValue("Shafter");
    await page.getByRole("link", { name: "Talk with Ian", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/home${version}#contact$`));
    for (const width of [1440, 1000, 768, 390, 360]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    await page.locator("#home").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByText("Home versions", { exact: true }).click();
    await page.getByRole("link", { name: version === 2 ? /^Home 3/ : /^Home 2/ }).click();
    await expect(page).toHaveURL(new RegExp(`/home${version === 2 ? 3 : 2}$`));
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation").getByRole("link", { name: "Development", exact: true }).click();
    await expect(page.locator("#development")).toBeFocused();
    await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });
}

test("the cropped mascot animates, can pause, and respects reduced motion", async ({ page }) => {
  await page.goto("/home2");
  const mascot = page.getByRole("button", { name: "Pause mascot animation" });
  await expect(mascot).toHaveAttribute("data-playing", "true");
  await expect(mascot.locator("img")).toHaveAttribute("src", /mascot-loop-224.webp$/);
  await mascot.click();
  await expect(page.getByRole("button", { name: "Play mascot animation" })).toHaveAttribute("data-playing", "false");
  await expect(page.getByRole("button", { name: "Play mascot animation" }).locator("img")).toHaveAttribute("src", /mascot-poster.png$/);
  await page.getByRole("button", { name: "Play mascot animation" }).click();
  await expect(mascot).toHaveAttribute("data-playing", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(mascot).toHaveAttribute("data-playing", "false");
  await expect(mascot.locator("img")).toHaveAttribute("src", /mascot-poster.png$/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(mascot).toHaveAttribute("data-playing", "true");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(mascot).toHaveAttribute("data-playing", "false");
});
