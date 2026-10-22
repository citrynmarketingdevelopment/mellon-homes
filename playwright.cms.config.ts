import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
// Isolated, disposable local test database. Never use the live Neon database here.
for (const line of readFileSync(".cms-test/test.env", "utf8").trim().split(/\r?\n/)) {
  const position = line.indexOf("="); process.env[line.slice(0, position)] = line.slice(position + 1);
}
const testDatabase = new URL(process.env.DATABASE_URL!);
if (testDatabase.hostname !== "127.0.0.1" || testDatabase.port !== "55438" || process.env.BETTER_AUTH_URL !== "http://127.0.0.1:3012") {
  throw new Error("CMS tests require the isolated local database and app. Run scripts/cms-test-setup.ps1.");
}
export default defineConfig({
  testDir: "./tests", testMatch: "cms.spec.ts", workers: 1, timeout: 90_000,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3012", channel: "chrome", screenshot: "only-on-failure" },
  // Exercise the actual production server, without development compile latency.
  webServer: { command: "npm run start -- --port 3012 --hostname 127.0.0.1", url: "http://127.0.0.1:3012/admin/login", reuseExistingServer: false, env: { NEXT_DIST_DIR: ".next" }, timeout: 120_000 },
});
