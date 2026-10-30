import { test, expect, type Page } from "@playwright/test";

async function fillLead(page: Page, balance = "") {
  await page.getByLabel("Full name", { exact: true }).fill("Local Homeowner");
  await page.getByLabel("Property address", { exact: true }).fill("15005 Merlot Cellars Dr, Bakersfield, CA 93314");
  await page.getByLabel("Email address", { exact: true }).fill("homeowner@example.test");
  await page.getByLabel("Phone number", { exact: true }).fill("6615550123");
  if (balance) await page.getByLabel(/Total outstanding loan balance/).fill(balance);
  await page.getByRole("checkbox", { name: /Ian Mellon may contact me/ }).check();
}

test("valuation form gates results, supports optional debt, and renders a property snapshot", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let calls = 0;
  await page.route("**/api/valuation", async route => {
    calls++;
    const payload = route.request().postDataJSON();
    expect(payload.name).toBe("Local Homeowner"); expect(payload.consent).toBe(true);
    expect(payload.loanBalance).toBeUndefined();
    await route.fulfill({ json: { status: "estimate", report: {
      address: payload.address, value: 533438, low: 500000, high: 560000, beds: 3, baths: 2,
      sqft: 2541, yearBuilt: 2005, propertyType: "Single Family", source: "RentCast", asOf: "2026-10-26T12:00:00Z",
    } } });
  });
  await page.goto("/#home-value");
  const submit = page.getByRole("button", { name: "Request my free home review" });
  await submit.click();
  expect(calls).toBe(0);
  await expect(page.getByText("$533,438", { exact: true })).toHaveCount(0);
  await fillLead(page);
  await submit.click();
  await expect(page.getByRole("heading", { name: "Here’s your starting point." })).toBeFocused();
  await expect(page.getByText("$533,438", { exact: true })).toBeVisible();
  await expect(page.getByText("Balance needed", { exact: true })).toBeVisible();
  await expect(page.getByText("2,541", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Check another property" }).click();
  await expect(page.getByLabel("Full name", { exact: true })).toBeVisible();
});

test("retry retains input and request ID, handles zero balance, and gives an honest personal-review fallback", async ({ page }) => {
  let attempt = 0, requestId = "";
  await page.route("**/api/valuation", async route => {
    const payload = route.request().postDataJSON();
    expect(payload.loanBalance).toBe(0);
    if (!attempt++) {
      requestId = payload.requestId;
      await route.fulfill({ status: 503, json: { error: "Please try again." } });
    } else {
      expect(payload.requestId).toBe(requestId);
      await route.fulfill({ json: { status: "requested" } });
    }
  });
  await page.goto("/#home-value");
  await fillLead(page, "0");
  await page.getByRole("button", { name: "Request my free home review" }).click();
  await expect(page.locator("#home-value").getByRole("alert")).toContainText("Please try again.");
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Local Homeowner");
  await page.getByRole("button", { name: "Request my free home review" }).click();
  await expect(page.getByRole("heading", { name: "Let’s take a closer look." })).toBeFocused();
  await expect(page.getByText(/Your details are saved/)).toBeVisible();
  await expect(page.getByText(/Estimated home value/)).toHaveCount(0);
});

test("valuation endpoint enforces origin, required lead details, and unavailable-storage errors", async ({ request }) => {
  const data = { requestId: crypto.randomUUID(), name: "Test Owner", address: "123 Test Street, Bakersfield, CA 93301", email: "test@example.test", phone: "6615550123", consent: true };
  expect((await request.post("/api/valuation", { data })).status()).toBe(403);
  const headers = { origin: "http://127.0.0.1:3014" };
  expect((await request.post("/api/valuation", { headers, data: { ...data, consent: false } })).status()).toBe(400);
  expect((await request.post("/api/valuation", { headers, data: { ...data, email: "" } })).status()).toBe(400);
  const unavailable = await request.post("/api/valuation", { headers, data });
  expect(unavailable.status()).toBe(503);
  expect(await unavailable.json()).toEqual({ error: expect.stringContaining("couldn’t save") });
});
