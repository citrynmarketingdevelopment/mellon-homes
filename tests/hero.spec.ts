import { test, expect, type BrowserContext } from "@playwright/test";

const mascotName = /^Mellon, the watermelon/;
async function safeInput(context: BrowserContext) {
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.reject(new Error("Disabled during tests"));
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    Document.prototype.exitPointerLock = () => {};
  });
}
test.beforeEach(async ({ context }) => safeInput(context));

test("decorative seeds pause on request, offscreen, and when the page is hidden", async ({ page }) => {
  await page.goto("/");
  const field = page.locator("[data-seed-field]");
  await expect(field.locator("span")).toHaveCount(14);
  await expect(field).toHaveAttribute("data-running", "");
  const seed = field.locator("span").first();
  expect(await seed.evaluate(node => getComputedStyle(node).animationPlayState)).toBe("running");
  await page.getByRole("button", {name:"Pause seed animation"}).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", {name:"Resume seed animation"})).toHaveAttribute("aria-pressed", "true");
  expect(await seed.evaluate(node => getComputedStyle(node).animationPlayState)).toBe("paused");
  await page.keyboard.press("Enter");
  await expect(field).toHaveAttribute("data-running", "");
  await page.mouse.wheel(0, 200);
  await expect.poll(() => field.evaluate(node => parseFloat((node as HTMLElement).style.getPropertyValue("--scroll-distance")))).toBeLessThan(-10);
  await page.locator("#seller-support").scrollIntoViewIfNeeded();
  await expect(field).not.toHaveAttribute("data-running", "");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-running", "");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {configurable:true, value:true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(field).not.toHaveAttribute("data-running", "");
});

test("the complete mascot fits, its eyes track both axes, and the body stays still", async ({ page }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("request", request => requests.push(request.url()));
  await page.goto("/");
  const stage = page.getByRole("img", { name: mascotName });
  await expect(stage).toHaveAttribute("data-status", "ready");
  await expect(page.locator("video, canvas")).toHaveCount(0);
  await expect(page.getByText("GO ON, SAY HELLO")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /New keys|Next chapter/ })).toHaveCount(0);
  const artwork = page.locator("[data-mascot-body]");
  const bounds = (await artwork.boundingBox())!;
  const heroBounds = (await page.locator("[data-hero]").boundingBox())!;
  expect(bounds.width).toBeGreaterThan(800);
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(heroBounds.y);
  expect(bounds.y + bounds.height).toBeLessThan(heroBounds.height);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(1440);
  const pupil = stage.locator('[data-pupil="0"]');
  const position = () => pupil.evaluate(node => {
    const matrix = (node as SVGGElement).transform.baseVal.consolidate()!.matrix;
    return { x: matrix.e, y: matrix.f };
  });
  for (const [x,y,axis,sign] of [[40,450,"x",-1],[1400,450,"x",1],[1000,130,"y",-1],[1000,825,"y",1]] as const) {
    await page.mouse.move(x,y);
    await expect.poll(async () => (await position())[axis] * sign).toBeGreaterThan(1);
    await expect(stage).toHaveAttribute("data-motion", "idle");
    expect(await artwork.boundingBox()).toEqual(bounds);
  }
  await page.mouse.move(-10,-10);
  await expect(stage).toHaveAttribute("data-motion","idle");
  expect(await position()).toEqual({x:0,y:0});
  await page.getByRole("button", { name:"Meet Mellon", exact:true }).click();
  await expect(stage).toHaveAttribute("data-motion","moving");
  await expect(page.getByRole("status")).toContainText("watch his eyes follow");
  await expect(stage).toHaveAttribute("data-motion","idle");
  expect(requests.some(url=>/\.glb$|\/videos\/|\/mellon-poses\//.test(url))).toBe(false);
  expect(errors).toEqual([]);
});

test("the cursor stays centered and disappears outside the hero", async ({ page }) => {
  await page.goto("/");
  const ring = page.locator("[data-cursor-ring]");
  await expect(page.getByRole("img",{name:mascotName})).toHaveAttribute("data-status","ready");
  for (const [x,y] of [[1000,300],[250,650]]) {
    await page.mouse.move(x,y);
    await expect(ring).toHaveAttribute("data-visible","");
    const box = (await ring.boundingBox())!;
    expect(box.x + box.width/2).toBeCloseTo(x,1);
    expect(box.y + box.height/2).toBeCloseTo(y,1);
  }
  await page.setViewportSize({width:1000,height:620});
  await page.mouse.move(800,250);
  const box = (await ring.boundingBox())!;
  expect(box.x + box.width/2).toBeCloseTo(800,1);
  await page.locator("#seller-support").scrollIntoViewIfNeeded();
  await expect(ring).not.toHaveAttribute("data-visible","");
});

test("navigation, gallery, specialist services and the complete pipeline work with a keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link",{name:"Find your home",exact:true}).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#mellon-properties$/);
  await expect(page.getByRole("heading",{name:"Fresh spaces. New possibilities."})).toBeInViewport();
  await page.getByRole("button",{name:"View living room"}).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button",{name:"View living room"})).toHaveAttribute("aria-pressed","true");
  await expect(page.getByText("Space for everyday life.",{exact:true})).toBeVisible();
  await expect.poll(() => page.getByRole("img",{name:/Illustrative open living room/}).evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button",{name:"Next photograph"}).click();
  await expect(page.getByRole("button",{name:"View kitchen"})).toHaveAttribute("aria-pressed","true");
  await expect.poll(() => page.getByRole("img",{name:/Illustrative kitchen/}).evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const support = page.locator("#seller-support");
  await support.scrollIntoViewIfNeeded();
  await expect(support.locator("article")).toHaveCount(4);
  for (const name of ["Pre-foreclosure & delinquency", "Probate", "Divorce", "Short sales"]) {
    await expect(support.getByRole("heading", {name, exact:true})).toBeVisible();
  }
  await support.getByRole("link",{name:"Let’s talk"}).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contact$/);
  await page.locator("#development").scrollIntoViewIfNeeded();
  await expect(page.locator("#stage-ready li")).toHaveCount(2);
  await expect(page.locator("#stage-planning li")).toHaveCount(3);
  await expect(page.locator("#stage-construction li")).toHaveCount(3);
  await expect(page.locator("#stage-ready")).toBeVisible();
  await expect(page.locator("#stage-planning")).toBeVisible();
  await expect(page.locator("#stage-construction")).toBeVisible();
  await page.getByRole("link",{name:"Ask Ian about projects ready to build"}).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole("heading",{name:"Find your kind of neighborhood."})).toHaveCount(0);
  await expect(page.locator('a[href*="realtor.com"]')).toHaveCount(0);
  await expect(page.locator('a[href="tel:+16618052481"]')).toHaveCount(1);
});

test("mobile tap tracking resets, menu navigation closes, and responsive layouts fit", async ({ browser }) => {
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await safeInput(context);
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3010");
  const stage=page.getByRole("img",{name:mascotName});
  await expect(stage).toHaveAttribute("data-status","ready");
  const hero=(await page.locator("[data-hero]").boundingBox())!;
  const art=(await page.locator("[data-mascot-body]").boundingBox())!;
  // The PNG has transparent side margins; check the visible character's alpha bounds.
  expect(art.x+art.width*89/1312).toBeGreaterThanOrEqual(0);
  expect(art.x+art.width*1241/1312).toBeLessThanOrEqual(391);
  expect(art.y+art.height).toBeLessThan(hero.height);
  await page.touchscreen.tap(350,500);
  const pupil=stage.locator('[data-pupil="0"]');
  await expect(pupil).not.toHaveAttribute("transform",/translate\(0(?:\.000)? 0(?:\.000)?\)/);
  await expect(pupil).toHaveAttribute("transform","translate(0.000 0.000)");
  await page.getByRole("button",{name:"Open navigation"}).tap();
  await page.getByRole("navigation").getByRole("link",{name:"Sell",exact:true}).tap();
  await expect(page).toHaveURL(/#seller-support$/);
  await expect(page.locator("[data-hero]")).not.toHaveAttribute("data-menu-open","");
  await expect(page.locator("#seller-support")).toBeFocused();
  for(const [width,height] of [[390,844],[360,640],[768,1024],[1000,620]]) {
    await page.setViewportSize({width,height});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  await context.close();
});

test("reduced motion keeps the original face and all content visible", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/");
  const stage=page.getByRole("img",{name:mascotName});
  await expect(stage).toHaveAttribute("data-status","ready");
  await stage.scrollIntoViewIfNeeded();
  const bounds=await stage.boundingBox();
  const pupils=stage.locator('[data-pupil]');
  const before=await pupils.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('transform')));
  await page.mouse.move(1200,300);
  await expect(stage).toHaveAttribute('data-motion','idle');
  expect(await pupils.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('transform')))).toEqual(before);
  expect(await stage.boundingBox()).toEqual(bounds);
  await expect(page.locator("[data-cursor-ring]")).not.toBeVisible();
  await page.getByRole("button",{name:"Meet Mellon",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Motion is paused");
  await expect(page.locator("[data-awaiting]")).toHaveCount(0);
  await expect(page.locator("#stage-ready")).toBeVisible();
  await expect(page.locator("[data-seed-field]")).not.toHaveAttribute("data-running", "");
  expect(await page.locator("[data-seed-field] span").first().evaluate(node => getComputedStyle(node).animationName)).toBe("none");
});

test("the page and all specialist information remain available without JavaScript", async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  await safeInput(context);
  const page=await context.newPage();
  await page.goto("http://127.0.0.1:3010");
  const image=page.locator("[data-mascot-body] img");
  await expect(image).toBeVisible();
  expect(await image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBe(1312);
  await expect(page.getByRole("heading",{name:"Fresh spaces. New possibilities."})).toBeVisible();
  await expect(page.locator("#development li")).toHaveCount(8);
  await expect(page.locator("#seller-support article")).toHaveCount(4);
  await expect(page.getByRole("heading",{name:"Divorce",exact:true})).toBeVisible();
  await expect(page.getByText("A balanced, professional approach to the property, with clear communication and respect for everyone involved.")).toBeVisible();
  await context.close();
});

test("eyes work without Canvas and pause when preferences or visibility change", async ({ page }) => {
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});
  await page.goto("/");
  const stage=page.getByRole("img",{name:mascotName});
  await expect(stage).toHaveAttribute("data-status","ready");
  const pupil=stage.locator('[data-pupil="0"]');
  await page.mouse.move(100,400);
  await expect(pupil).not.toHaveAttribute("transform","translate(0.000 0.000)");
  await expect(stage).toHaveAttribute("data-motion","idle");
  const settled=await pupil.getAttribute("transform");
  await page.waitForTimeout(200);
  expect(await pupil.getAttribute("transform")).toBe(settled);
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(pupil).toHaveAttribute("transform","translate(0.000 0.000)");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.mouse.move(1300,500);
  await expect(pupil).not.toHaveAttribute("transform","translate(0.000 0.000)");
  await page.evaluate(()=>{
    Object.defineProperty(document,"hidden",{configurable:true,value:true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(stage).toHaveAttribute("data-motion","idle");
  await expect(pupil).toHaveAttribute("transform","translate(0.000 0.000)");
  await expect(page.locator("[data-cursor-ring]")).not.toHaveAttribute("data-visible","");
});
