import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
// Isolated, disposable local test database. Never use the live Neon database here.
for (const line of readFileSync(".cms-test/test.env", "utf8").trim().split(/\r?\n/)) {
  const position = line.indexOf("="); process.env[line.slice(0, position)] = line.slice(position + 1);
}
export default defineConfig({
  testDir: "./tests", testMatch: "cms.spec.ts", workers: 1, timeout: 90_000,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3012", channel: "chrome", screenshot: "only-on-failure" },
  webServer: { command: "npm run dev -- --port 3012 --hostname 127.0.0.1", url: "http://127.0.0.1:3012/admin/login", reuseExistingServer: false, env: { NEXT_DIST_DIR: ".cms-test/next" }, timeout: 120_000 },
});
