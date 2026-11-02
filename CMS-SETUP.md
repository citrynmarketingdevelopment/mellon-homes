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

The workspace has separate **Overview**, **Listings**, **New listing**, **Home value leads**, and **Account** screens. On desktop, use the sidebar; on phones, use the bottom navigation.

- **Overview** shows actual listing totals, published/draft counts, featured counts, and recent edits.
- **Listings** supports search, status/featured filters, price sorting, and pagination. Change the featured switch or publication selector directly in a row. Delete opens a confirmation dialog; Escape cancels it.
- The public homepage shows Mellon's published properties with availability filters and price sorting. Its former address-search control now links to the home-value form. `/listings` can search only Mellon's own published collection. There is no MLS integration. Mobile cards use a compact layout; an empty collection shows a contact prompt without example properties.

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

## Home valuation and lead capture

The main homepage is the only design route. `/home2` and `/home3` permanently redirect to `/`. Construction imagery is illustrative; development projects and their descriptions can be maintained in `/admin/development`.

Run `npm run valuation:migrate` against the intended database to add the lead and usage-counter tables. The full `cms:migrate` also applies this additive migration. Homeowners must provide a name, full property address with ZIP code, email, phone, and contact consent. A total outstanding property-loan balance is optional. Blank means unknown; zero means paid off; negative equity is preserved.

Requests are saved in PostgreSQL before calling a valuation provider or sending email. Authorized admins can review the latest 200 in `/admin/leads`, including email-delivery status. If the database cannot save a request, the form displays an error and does not claim success or reveal an estimate. The app does not put personal information or credentials in logs.

Without `RENTCAST_API_KEY`, the form offers a personal home review and confirms only that the request was saved. With a key, it calls RentCast's value-estimate endpoint, then displays available property attributes, a value range, and equity when a balance was supplied. Provider outages, unavailable properties, and the monthly quota fall back to a saved personal-review request. No fabricated estimates, property photos, mortgage data, or title-source claims are displayed.

Set these server-only environment variables, then restart/redeploy:

- `RENTCAST_API_KEY`: a RentCast API key authorized for `/v1/avm/value`.
- `VALUATION_MONTHLY_LIMIT`: defaults to 50. A shared, atomic PostgreSQL counter caps calls from this application per UTC calendar month, including unsuccessful attempts. Set 0 to disable automated lookups. Usage by other applications sharing the same provider account is outside this cap.
- `VALUATION_SITE_ORIGIN`: the exact public HTTPS origin, without a trailing slash, especially behind a reverse proxy. Local development can use the incoming Host header.
- `VALUATION_TRUSTED_IP_HEADER`: only a header overwritten by the trusted deployment proxy, for example `x-real-ip`. Requests are limited to 3 per email and 10 per IP per UTC hour. Without this setting the site uses a shared 10/hour limit. Idempotent retries do not consume another lookup.
- `SMTP_API` and `SMTP_CHANNEL`: SMTP.com credentials, matching the trends-frontend integration. Notifications go to `ianmellon@yahoo.com` from the authenticated `contactforms@citryn.com` sender, with the homeowner as Reply-To. A separate HTML/plain-text thank-you goes to the homeowner after the broker notification is accepted. Both statuses are recorded in the private inbox; there is no automatic mail retry worker. See README.md for the shared email configuration and preview command.

As checked October 26, 2026, [RentCast includes 50 free API calls/month, with paid overages](https://www.rentcast.io/api). Its [value estimate endpoint](https://developers.rentcast.io/reference/value-estimate) uses comparable sale listings. This integration does not claim verified closed-sale comps or three title sources. Equity is the automated value less homeowner-reported debt, before selling costs and unreported liens; it is not a lender payoff quote or appraisal. Live provider data and SMTP delivery still need validation using the configured accounts.

`npm run test:valuation` exercises the service against a temporary schema in the isolated local PostgreSQL test cluster, with local provider/mail doubles. It covers lead persistence, idempotency, invalid fields, blank/zero/negative equity, provider/mail failures, rate limits, and concurrent quota enforcement. `tests/valuation.spec.ts` covers form gating, results, retries, and API validation. `tests/valuation-cms.spec.ts` covers a real form submission through the API/database and the authenticated private inbox. These tests do not contact real homeowners or the paid valuation service.
