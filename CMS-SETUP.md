# Mellon listing CMS

The existing Next.js app now includes an admin-only CMS at `/admin`, public listing cards on the homepage, a full `/listings` index, and individual property pages. Neon stores listings, optimized photos, admin accounts, and sessions. No separate image-storage service is needed for this small installation.

## Connect Neon

1. Fill in the blank server-only settings in `.env` (or `.env.local`). `.env.example` contains the same keys without secrets. Never prefix these settings with `NEXT_PUBLIC_`.
2. Set `DATABASE_URL` to the Neon pooled PostgreSQL connection string, including its SSL settings.
3. Set `BETTER_AUTH_URL` to the exact website origin. Locally use `http://127.0.0.1:3010`; on a deployed site use its HTTPS URL. Login cookies are origin-specific.
4. Generate `BETTER_AUTH_SECRET` using `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` and save the output in the environment. Use a different secret in production.
5. Set `ADMIN_EMAILS` to the comma-separated addresses allowed to manage listings.
6. Fill `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_NAME`, and a unique `ADMIN_BOOTSTRAP_PASSWORD` of at least 12 characters. The email must appear in `ADMIN_EMAILS`.
7. Run `npm run cms:migrate`, then `npm run cms:admin`. Clear the bootstrap password afterward; it is not used during login. Restart the dev server after editing environment values.
8. Run `npm run dev -- --port 3010 --hostname 127.0.0.1` and open `/admin`.

To add another administrator, add their email to `ADMIN_EMAILS`, set their bootstrap fields, and run `cms:admin` again. Existing accounts are never overwritten. Removing an email from the allowlist revokes its CMS access immediately after the environment change is applied, including existing sessions. Public account registration is disabled. Account creation is a local operator command, not a public endpoint.

For a deployed environment, configure the same server-only values in the hosting dashboard, set the HTTPS origin, apply migrations to the intended database, and provision admin accounts there. Never deploy the test environment. Put a trusted reverse proxy in front of the application that overwrites `x-real-ip`; the auth limiter uses that header and stores its counters in PostgreSQL. HTTPS is required for production.

## Everyday use

The workspace has separate **Overview**, **Listings**, **New listing**, and **Account** screens. On desktop, use the sidebar; on phones, use the bottom navigation.

- **Overview** shows actual listing totals, published/draft counts, featured counts, and recent edits.
- **Listings** supports search, status/featured filters, price sorting, and pagination. Change the featured switch or publication selector directly in a row. Delete opens a confirmation dialog; Escape cancels it.
- The public homepage and `/listings` include searchable property cards, availability filters, and price sorting. Mobile cards use a compact layout. Only published listings reach the public browser; an empty collection shows a contact prompt without example properties.

- New listing: enter the address, price, bedrooms, bathrooms, area, type, description, and availability.
- Upload up to 12 JPG, PNG, or WebP photos, each below 2 MB. Images are validated, orientation-corrected, resized to at most 1600 pixels wide, and stored as WebP without original metadata.
- Use **Make cover** to choose the first photo. Removing a photo takes it off the listing when saved.
- Save as **Draft** to keep it private. **Published** requires a photo and immediately places the listing on the public site, without a rebuild.
- **Featured** listings appear first. The homepage initially displays six properties, with a **Show more homes** button. The listing index and dashboard support up to 200 entries in this simple CMS.
- Set a published listing back to **Draft** to remove its detail page and photo access from the public site. Set availability to **Pending** or **Sold** if it should stay visible with that label.
- Deletion requires an explicit confirmation. Conflicting edits from another session are rejected rather than silently overwriting them.
- Use **Change password** in the dashboard to replace your initial password. This requires your current password and signs out other sessions. Once saved securely in your password manager, clear `ADMIN_BOOTSTRAP_PASSWORD` from the local environment.
- Uploaded photos not referenced by any listing are retained for 24 hours so interrupted edits can be recovered. Run `npm run cms:cleanup` periodically to remove old, unreferenced uploads.

Until Neon is connected, `/admin/login` shows setup guidance and disables login. The public property browser shows a helpful empty state. If a connected database is unavailable, the listing section shows a contact fallback; it does not expose drafts or connection details.

## Implementation and checks

- Better Auth handles password hashing, revocable database sessions, CSRF/origin checks, and login rate limits. CMS endpoints additionally verify the email allowlist on every read and mutation.
- Listing writes use server-side validation and parameterized PostgreSQL queries. Edits use revisions to detect conflicts.
- Photo endpoints require an admin session unless a published listing references the photo. Public photo responses do not use a persistent cache so unpublishing takes effect on subsequent requests.
- The app uses Webpack because this Windows project drive cannot create the junctions Turbopack requires for the PostgreSQL package. A build-only preload also normalizes the drive’s incorrect `readlink` error for verified non-links; it does nothing on Linux and does not change application behavior.
- Run `npm run typecheck`, `npx eslint src scripts/cms-*.ts tests`, and `npm run build`.
- The CMS integration tests use a disposable local PostgreSQL cluster on port 55438 and a separate production app on 3012. Run `powershell -ExecutionPolicy Bypass -File scripts/cms-test-setup.ps1`, then `npm run test:cms` (builds first). Test database operations never use `.env` credentials. Stop the test database with `pg_ctl -D .cms-test/postgres stop` afterward.

Local PostgreSQL tests cover login/logout, uploads, draft privacy, publishing, homepage/detail rendering, edits, quick featured/status changes, search and filters, mobile layouts, conflict detection, unpublishing, deletion, password changes, blocked anonymous writes, disabled registration, and rate limiting. The test suite never creates test listings in Neon. `npm run test:e2e` separately builds and checks the hero and empty listing browser on port 3014 with the database disabled.
