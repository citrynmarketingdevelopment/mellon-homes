import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { database } from "../src/lib/cms/db";

const email = "valuation-browser-test@example.test";
// Each test starts with a fresh login allowance in the disposable local database.
test.beforeEach(async () => { await database().query('DELETE FROM "rateLimit"'); });
test.beforeAll(async () => {
  await database().query(await readFile("database/valuation.sql", "utf8"));
  await database().query("DELETE FROM mellon_valuation_leads WHERE data->>'email' = $1", [email]);
  // Repeated local runs must not inherit the previous run's hourly allowance.
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  await database().query("DELETE FROM mellon_valuation_usage WHERE key LIKE $1 OR key LIKE $2", [`email:${hash(email)}:%`, `ip:${hash("shared") }:%`]);
});
test.afterAll(async () => {
  await database().query("DELETE FROM mellon_valuation_leads WHERE data->>'email' = $1", [email]);
  await database().end();
});

test("a homeowner request reaches the database and the private broker inbox", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/#home-value");
  await page.getByLabel("Full name", { exact: true }).fill("Valuation Browser Test");
  await page.getByLabel("Property address", { exact: true }).fill("123 Test Street, Bakersfield, CA 93301");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Phone number", { exact: true }).fill("6615550123");
  await page.getByLabel(/Total outstanding loan balance/).fill("180000");
  await page.getByRole("checkbox", { name: /Ian Mellon may contact me/ }).check();
  await page.getByRole("button", { name: "Request my free home review" }).click();
  await expect(page.getByRole("heading", { name: "Let’s take a closer look." })).toBeVisible();
  const saved = (await database().query("SELECT data, result, email_status FROM mellon_valuation_leads WHERE data->>'email' = $1", [email])).rows;
  expect(saved).toHaveLength(1);
  expect(saved[0].data.loanBalance).toBe(180000);
  expect(saved[0].result).toEqual({ status: "requested" });
  expect(saved[0].email_status).toBe("unconfigured");
  expect(await (await request.get("/")).text()).not.toContain(email);
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.ADMIN_BOOTSTRAP_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("link", { name: "Home value leads", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Valuation Browser Test" })).toBeVisible();
  await expect(page.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
  await expect(page.getByText("SMTP.com not configured; follow up from this inbox", { exact: false }).first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: ".cms-test/mobile-lead-inbox.png", fullPage: true });
});
