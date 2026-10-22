import { chromium } from "playwright-core";
import fs from "node:fs/promises";
const out = "assets/previews/landing";
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [name, width, height] of [["desktop",1440,900],["tablet",768,1024],["mobile",390,844],["compact",360,640]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    await context.addInitScript(() => {
      Element.prototype.requestPointerLock = () => Promise.reject(new Error("Disabled in review"));
      Element.prototype.setPointerCapture = () => {};
      Element.prototype.releasePointerCapture = () => {};
      Document.prototype.exitPointerLock = () => {};
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3010", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(-10,-10);
    await page.locator("[data-hero]").screenshot({ path: `${out}/${name}-hero.png` });
    if (name === "desktop") {
      for (const [direction,x,y] of [["left",40,450],["right",1400,450],["up",1020,120],["down",1020,830]]) {
        await page.mouse.move(x,y);
        await page.waitForTimeout(850);
        await page.locator("[data-mascot-body]").screenshot({ path: `${out}/eyes-${direction}.png` });
      }
    }
    for (const id of ["mellon-properties","seller-support","development","ian","area-search","contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(650);
      if (name === "desktop" || name === "mobile") await page.locator(`#${id}`).screenshot({ path: `${out}/${name}-${id}.png` });
    }
    await page.screenshot({ path: `${out}/${name}-page.png`, fullPage: true });
    console.log(name, await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, images: [...document.images].filter(i=>!i.complete || !i.naturalWidth).map(i=>i.src) })));
    await context.close();
  }
} finally { await browser.close(); }
