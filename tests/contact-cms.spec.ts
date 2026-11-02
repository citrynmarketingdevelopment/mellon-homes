import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { database } from "../src/lib/cms/db";

const email = "specialty-test@example.test";
const headers = { Origin: "http://127.0.0.1:3012" };
// Each test starts with a fresh login allowance in the disposable local database.
test.beforeEach(async () => { await database().query('DELETE FROM "rateLimit"'); });
test.afterAll(async () => { await database().query("DELETE FROM mellon_contact_requests WHERE data->>'email'=$1", [email]); await database().end(); });
test("specialty inquiry is saved once, protected, and available in the broker inbox", async ({ page, request }) => {
  await database().query("DELETE FROM mellon_contact_requests WHERE data->>'email'=$1", [email]);
  await database().query("DELETE FROM mellon_showing_usage WHERE key LIKE 'contact:%'");
  await page.goto("/probate-real-estate-bakersfield#specialty-contact");
  await page.getByLabel("Your name").fill("Specialty Test Visitor");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Phone", { exact: true }).fill("6615550100");
  await page.getByLabel("Property address (optional)").fill("100 Inherited Test Lane");
  await page.getByLabel("How can Ian help?").fill("I would like to discuss selling an inherited home.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send my inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("Your inquiry is saved");
  const row = (await database().query("SELECT * FROM mellon_contact_requests WHERE data->>'email'=$1", [email])).rows[0];
  expect(row.email_status).toBe("unconfigured"); expect(row.confirmation_status).toBe("unconfigured");
  const data = { ...row.data }; delete data.consentText;
  expect((await request.post("/api/contact", { headers, data })).status()).toBe(200);
  expect((await database().query("SELECT id FROM mellon_contact_requests WHERE data->>'email'=$1", [email])).rowCount).toBe(1);
  expect((await request.post("/api/contact", { headers, data: { ...data, message: "Different message" } })).status()).toBe(409);
  expect((await request.post("/api/contact", { headers: { Origin: "https://untrusted.example" }, data })).status()).toBe(403);
  for (const changes of [{ consent: false }, { specialty: "invalid-service" }, { website: "spam" }, { email: "bad" }]) expect((await request.post("/api/contact", { headers, data: { ...data, ...changes, requestId: randomUUID() } })).status()).toBe(400);
  await page.goto("/admin/inquiries"); await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Email", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Specialty inquiries", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Specialty Test Visitor" })).toBeVisible();
  await expect(page.getByText("I would like to discuss selling an inherited home.")).toBeVisible();
});
