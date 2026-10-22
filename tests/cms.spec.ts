import { test, expect } from "@playwright/test";
import { database } from "../src/lib/cms/db";

test.afterAll(async () => { await database().end(); });
test("admin manages a listing through its entire public lifecycle", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/admin"); await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Email", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "+ New listing", exact: true }).click();
  await page.getByLabel("Listing title").fill("CMS integration test home");
  await page.getByLabel("Street address").fill("100 Test Street");
  await page.getByLabel("City", { exact: true }).fill("Bakersfield");
  await page.getByLabel("ZIP code").fill("93301");
  await page.getByLabel("Price ($)").fill("450000");
  await page.getByLabel("Bedrooms").fill("3");
  await page.getByLabel("Bathrooms").fill("2.5");
  await page.getByLabel("Area (sq ft)").fill("1800");
  await page.getByLabel("Description", { exact: true }).fill("Disposable integration test listing, never published to the live site.");
  await page.getByLabel("Add photos").setInputFiles("public/images/properties/exterior.png");
  await expect(page.getByRole("button", { name: "Cover photo" })).toBeVisible();
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page).toHaveURL(/\/admin\/listings\/[a-f0-9-]{36}$/);
  const id = page.url().split("/").at(-1)!;
  const saved = (await database().query("SELECT data FROM mellon_listings WHERE id=$1", [id])).rows[0].data;
  const photo = saved.photos[0];
  expect((await request.get(`/listings/${id}`)).status()).toBe(404);
  expect((await request.get(`/api/photos/${photo}`)).status()).toBe(404);
  expect(await (await request.get("/")).text()).not.toContain("CMS integration test home");
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Published." })).toBeVisible();
  expect(await (await request.get("/")).text()).toContain("CMS integration test home");
  expect((await request.get(`/listings/${id}`)).status()).toBe(200);
  const image = await request.get(`/api/photos/${photo}`);
  expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toBe("image/webp");
  await page.getByLabel("Price ($)").fill("460000");
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect.poll(async () => (await request.get(`/listings/${id}`)).text()).toContain("460,000");
  const stale = await page.request.put(`/api/admin/listings/${id}`, { headers: { Origin: "http://127.0.0.1:3012" }, data: { listing: saved, revision: 1 } });
  expect(stale.status()).toBe(409);
  const crossSite = await page.request.delete(`/api/admin/listings/${id}`, { headers: { Origin: "https://untrusted.example" }, data: { revision: 3 } });
  expect(crossSite.status()).toBe(403);
  await page.getByLabel("Publication status").selectOption("draft");
  await page.getByRole("button", { name: "Save listing" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved." })).toBeVisible();
  expect((await request.get(`/listings/${id}`)).status()).toBe(404);
  expect((await request.get(`/api/photos/${photo}`)).status()).toBe(404);
  await page.reload(); await expect(page.getByLabel("Price ($)")).toHaveValue("460000");
  await page.getByRole("button", { name: "Delete listing", exact: true }).click();
  await page.getByRole("button", { name: "Yes, delete listing" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect((await database().query("SELECT id FROM mellon_listings WHERE id=$1", [id])).rowCount).toBe(0);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await page.request.get("/api/admin/listings")).status()).toBe(401);
  expect(errors).toEqual([]);
});

test("anonymous mutations and public registration are blocked", async ({ request }) => {
  for (const path of ["/api/admin/listings", "/api/admin/photos"]) {
    expect((await request.post(path, { headers: { Origin: "http://127.0.0.1:3012" }, data: {} })).status()).toBe(401);
  }
  expect((await request.post("/api/auth/sign-up/email", { data: {} })).status()).toBe(404);
  const results = [];
  for (let index = 0; index < 7; index++) {
    results.push((await request.post("/api/auth/sign-in/email", { headers: { Origin: "http://127.0.0.1:3012", "x-real-ip": "192.0.2.200" }, data: { email: "nobody@example.test", password: "incorrect-password" } })).status());
  }
  expect(results).toContain(429);
});
