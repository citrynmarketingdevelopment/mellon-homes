import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: 'cms.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  use: {
    actionTimeout: 15_000,
    baseURL: 'http://127.0.0.1:3014',
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start -- --port 3014 --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3014',
    reuseExistingServer: false,
    // Hero/gallery regression checks intentionally use the unconfigured fallback.
    // CMS tests run against their own isolated database and port instead.
    env: { DATABASE_URL: '', ADMIN_EMAILS: '', BETTER_AUTH_SECRET: '' },
    timeout: 120_000,
  },
});
