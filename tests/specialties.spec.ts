import { test, expect } from "@playwright/test";
import { specialties } from "../src/lib/specialties";

test("specialty pages have unique SEO, readable content, valid images and responsive layouts", async ({ page, request }) => {
  const titles = new Set<string>();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const item of specialties) {
    await page.goto(`/${item.slug}`);
    await expect(page).toHaveTitle(item.title); titles.add(await page.title());
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", item.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://mellonhomes.com/${item.slug}`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://mellonhomes.com/${item.slug}`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.heading);
    await expect(page.locator("main")).toContainText(item.overview);
    await expect.poll(() => page.getByAltText(item.imageAlt).evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
    const graph = schema.map(text => JSON.parse(text)).find(data => data["@graph"])["@graph"];
    expect(graph.map((node: Record<string,string>) => node["@type"])).toEqual(["Service", "BreadcrumbList", "FAQPage"]);
    const faq = page.locator("main details").first();
    await faq.locator("summary").click(); await expect(faq.locator("p")).toBeVisible();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: `.cms-test/specialty-${item.image}-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `.cms-test/specialty-${item.image}-mobile.png`, fullPage: true });
  }
  expect(titles.size).toBe(5);
  expect((await request.get("/not-a-specialty")).status()).toBe(404);
});

test("Specialties navigation supports keyboard, mobile, and retired-home redirects", async ({ page, request }) => {
  await page.goto("/");
  const summary = page.getByRole("navigation", { name: "Main navigation" }).locator("summary");
  await summary.focus(); await page.keyboard.press("Enter");
  const first = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Pre-foreclosure", exact: true });
  await expect(first).toBeVisible(); await page.keyboard.press("Escape"); await expect(summary).toBeFocused();
  await expect(first).not.toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await summary.click(); await first.click();
  await expect(page).toHaveURL(/pre-foreclosure-real-estate-bakersfield$/);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  for (const path of ["/home2", "/home3"]) {
    const response = await request.get(path, { maxRedirects: 0 }); expect(response.status()).toBe(308); expect(response.headers().location).toBe("/");
  }
});

test("robots and sitemap advertise the public canonical site", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: https://mellonhomes.com/sitemap.xml"); expect(robots).toContain("Disallow: /admin");
  const sitemap = await request.get("/sitemap.xml"); expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const item of specialties) expect(xml).toContain(`https://mellonhomes.com/${item.slug}`);
  expect(xml).not.toContain("/admin"); expect(xml).not.toContain("/home2"); expect(xml).not.toContain("localhost");
});
