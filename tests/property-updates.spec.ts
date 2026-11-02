import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { database } from "../src/lib/cms/db";
import { defaultProjects } from "../src/lib/cms/development-data";
import { listingSchema } from "../src/lib/cms/validation";
import sharp from "sharp";

const origin = "http://127.0.0.1:3012";
const headers = { Origin: origin };
const listingId = randomUUID();
const draftId = randomUUID();
const soldId = randomUUID();
const email = "showing-test@example.test";
const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
const listing = { address: "200 Showing Test Lane", title: "Old custom title", city: "Bakersfield", state: "CA", zip: "93301", price: 500000, beds: 3, baths: 2, sqft: 1800, propertyType: "House", description: "A local property for showing request tests.", status: "published", availability: "For sale", featured: false, photos: [] };
async function login(page: Page) {
  // Reset only the disposable database's allowance for independent test logins.
  await database().query('DELETE FROM "rateLimit"');
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test.beforeAll(async () => {
  for (const [id, changes] of [[listingId, {}], [draftId, { status: "draft" }], [soldId, { availability: "Sold" }]] as const)
    await database().query("INSERT INTO mellon_listings (id, data) VALUES ($1,$2)", [id, JSON.stringify({ ...listing, ...changes })]);
  await database().query("DELETE FROM mellon_showing_requests WHERE data->>'email'=$1", [email]);
  await database().query("DELETE FROM mellon_showing_usage");
});
test.afterAll(async () => {
  await database().query("DELETE FROM mellon_listings WHERE id=ANY($1::uuid[])", [[listingId, draftId, soldId]]);
  await database().query("DELETE FROM mellon_showing_requests WHERE data->>'email'=$1", [email]);
  await database().query("DELETE FROM mellon_showing_usage");
  await database().end();
});

test("address titles and optional property details preserve older listings", async ({ page }) => {
  const result = listingSchema.parse({ ...listing, status: "draft", title: undefined });
  expect(result).toMatchObject({ title: listing.address, lotSize: null, pool: null, spa: null });
  expect(listingSchema.safeParse({ ...listing, status: "draft", lotSize: -1 }).success).toBe(false);
  await page.goto(`/listings/${listingId}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(listing.address);
  await expect(page.getByText("Pool: No")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Schedule a Showing" })).toBeVisible();
  await page.goto(`/listings/${soldId}`);
  await expect(page.getByRole("link", { name: "Schedule a Showing" })).toHaveCount(0);
});

test("a listing accepts 50 uploaded photos and rejects a 51st", async ({ page, request }) => {
  await login(page);
  await page.goto("/admin/listings/new");
  const buffer = await sharp({ create: { width: 16, height: 16, channels: 3, background: "#073f35" } }).png().toBuffer();
  const files = Array.from({ length: 50 }, (_, index) => ({ name: `photo-${index + 1}.png`, mimeType: "image/png", buffer }));
  const ids: string[] = [];
  let createdId: string | undefined;
  page.on("response", async response => {
    if (response.url().endsWith("/api/admin/photos") && response.status() === 201) ids.push((await response.json()).id);
  });
  try {
    await page.getByLabel("Add photos").setInputFiles([...files, files[0]]);
    await expect(page.getByRole("alert").filter({ hasText: "Use up to 50 photos per listing." })).toBeVisible();
    await expect(page.getByAltText("Listing photo 1", { exact: true })).toHaveCount(0);
    await page.getByLabel("Add photos").setInputFiles(files);
    await expect(page.getByRole("status")).toHaveText("50/50 photos", { timeout: 45000 });
    await expect(page.getByAltText("Listing photo 50", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Add photos")).toBeDisabled();
    expect(ids).toHaveLength(50);
    const data = { ...listing, address: "50 Photo Test Lane", photos: ids };
    const saved = await page.request.post("/api/admin/listings", { headers, data });
    expect(saved.status()).toBe(201);
    createdId = (await saved.json()).id;
    expect((await database().query("SELECT data FROM mellon_listings WHERE id=$1", [createdId])).rows[0].data.photos).toEqual(ids);
    const overflow = await page.request.post("/api/admin/listings", { headers, data: { ...data, photos: [...ids, randomUUID()] } });
    expect(overflow.status()).toBe(400);
    await page.goto(`/listings/${createdId}`);
    await expect(page.getByAltText("50 Photo Test Lane, photo 50", { exact: true })).toBeVisible();
    expect((await request.get(`/api/photos/${ids[49]}`)).status()).toBe(200);
  } finally {
    if (createdId) await database().query("DELETE FROM mellon_listings WHERE id=$1", [createdId]);
    await database().query("DELETE FROM mellon_photos WHERE id=ANY($1::uuid[])", [ids]);
  }
});

test("showing form saves contact details and preferred time in private inbox", async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/listings/${listingId}#schedule-showing`);
  await page.getByLabel("Your name").fill("Showing Test Visitor");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Phone", { exact: true }).fill("6615550100");
  await page.getByLabel("Preferred date").fill(tomorrow);
  await page.getByLabel("Preferred time (Pacific)").fill("14:30");
  await page.getByLabel("Anything you’d like Ian to know? (optional)").fill("Interested in the backyard and pool.");
  await page.getByRole("checkbox").check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".cms-test/showing-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Request showing" }).click();
  await expect(page.getByRole("status")).toContainText("Ian will contact you to confirm");
  const { rows } = await database().query("SELECT data,email_status FROM mellon_showing_requests WHERE data->>'email'=$1", [email]);
  expect(rows).toHaveLength(1);
  expect(rows[0].data).toMatchObject({ date: tomorrow, time: "14:30", email, consent: true, listingId });
  expect(rows[0].email_status).toBe("unconfigured");
  const { address, consentText, ...retry } = rows[0].data;
  expect(address).toContain(listing.address); expect(consentText).toContain("contact me");
  expect((await request.post("/api/showings", { headers, data: retry })).status()).toBe(200);
  expect((await database().query("SELECT id FROM mellon_showing_requests WHERE data->>'email'=$1", [email])).rowCount).toBe(1);
  expect((await request.post("/api/showings", { headers, data: { ...retry, notes: "Changed" } })).status()).toBe(409);
  await page.goto("/admin/showings");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await login(page);
  await page.getByRole("link", { name: "Showing requests", exact: true }).click();
  await expect(page.getByText("Showing Test Visitor")).toBeVisible();
  await expect(page.getByText("SMTP.com not configured; follow up from this inbox", { exact: false }).first()).toBeVisible();
});

test("showing API rejects invalid, cross-origin, unavailable and excessive requests", async ({ request }) => {
  const data = { requestId: randomUUID(), listingId, name: "API Test", email, phone: "6615550100", date: tomorrow, time: "15:00", notes: "", consent: true, website: "" };
  expect((await request.post("/api/showings", { headers: { Origin: "https://other.example" }, data })).status()).toBe(403);
  for (const changes of [{ consent: false }, { date: "2020-01-01" }, { time: "25:00" }, { website: "spam" }, { email: "bad" }, { date: "2026-02-30" }])
    expect((await request.post("/api/showings", { headers, data: { ...data, ...changes } })).status()).toBe(400);
  for (const id of [draftId, soldId, randomUUID()])
    expect((await request.post("/api/showings", { headers, data: { ...data, listingId: id } })).status()).toBe(404);
  expect((await request.post("/api/showings", { headers, data: { ...data, notes: "a".repeat(9000) } })).status()).toBe(413);
  const statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await request.post("/api/showings", { headers, data: { ...data, requestId: randomUUID() } })).status());
  expect(statuses).toContain(200); expect(statuses).toContain(429);
});

test("pipeline edits persist publicly with descriptions, counts, empty stages and conflict checks", async ({ page, request }) => {
  const old = (await database().query("SELECT * FROM mellon_content WHERE key='development'")).rows[0];
  try {
    await database().query("DELETE FROM mellon_content WHERE key='development'");
    expect((await request.put("/api/admin/development", { headers, data: { projects: [], revision: 0 } })).status()).toBe(401);
    await login(page);
    await page.getByRole("link", { name: "Development pipeline", exact: true }).click();
    await expect(page.getByLabel("Address", { exact: true })).toHaveCount(8);
    await page.getByLabel("Project description").first().fill("Construction update: spacious layouts and private outdoor space. Ask Ian about expected completion.");
    await page.getByRole("button", { name: "Add project", exact: true }).click();
    await page.getByLabel("Address", { exact: true }).last().fill("300 New Project Avenue");
    await page.getByLabel("City", { exact: true }).last().fill("Delano");
    await page.getByLabel("Property type", { exact: true }).last().fill("Fourplex");
    await page.getByLabel("Stage", { exact: true }).last().selectOption("ready");
    await page.getByRole("button", { name: "Save pipeline" }).click();
    await expect(page.getByRole("status")).toContainText("Pipeline saved");
    await page.reload();
    await expect(page.getByLabel("Address", { exact: true }).last()).toHaveValue("300 New Project Avenue");
    const home = await (await request.get("/")).text();
    expect(home).toContain("Construction update: spacious layouts"); expect(home).toContain("300 New Project Avenue");
    expect((await page.request.put("/api/admin/development", { headers, data: { projects: defaultProjects, revision: 0 } })).status()).toBe(409);
    expect((await page.request.put("/api/admin/development", { headers: { Origin: "https://other.example" }, data: { projects: [], revision: 1 } })).status()).toBe(403);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: ".cms-test/pipeline-editor-mobile.png", fullPage: true });
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Remove project 9", exact: true }).click();
    await page.getByRole("button", { name: "Save pipeline" }).click();
    await expect(page.getByRole("status")).toContainText("Pipeline saved");
    expect(await (await request.get("/")).text()).not.toContain("300 New Project Avenue");
    await page.goto("/");
    await page.locator("#development").scrollIntoViewIfNeeded();
    await expect(page.getByText("Construction update: spacious layouts", { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: ".cms-test/pipeline-public-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: ".cms-test/pipeline-public-desktop.png", fullPage: true });
    expect((await page.request.put("/api/admin/development", { headers, data: { projects: [], revision: 2 } })).status()).toBe(200);
    expect(await (await request.get("/")).text()).toContain("No projects at this stage");
  } finally {
    await database().query("DELETE FROM mellon_content WHERE key='development'");
    if (old) await database().query("INSERT INTO mellon_content (key, data, revision) VALUES ('development',$1,$2)", [JSON.stringify(old.data), old.revision]);
  }
});
