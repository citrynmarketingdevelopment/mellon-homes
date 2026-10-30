import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const directory = "design/home1-green-gold";
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [name, width, height] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:3015", { waitUntil: "networkidle" });
    for (const photo of await page.locator("img").all()) {
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(img => img.decode().catch(() => {}));
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/${name}-full.png`, fullPage: true });
    for (const section of ["home", "mellon-properties", "home-value", "development"]) {
      await page.locator(`#${section}`).screenshot({ path: `${directory}/${name}-${section}.png` });
    }
    console.log(JSON.stringify({ name, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errors }));
    await page.close();
  }
} finally { await browser.close(); }
