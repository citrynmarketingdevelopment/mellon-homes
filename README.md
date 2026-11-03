# Mellon Real Estate

Next.js App Router site for Ian Mellon, California Real Estate Broker, DRE #01921587. The public canonical domain is https://mellonhomes.com.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run dev -- --port 3010` to match the example authentication origin. The homepage uses the supplied 2D mascot with pointer-responsive SVG eyes; it does not load a 3D model. The alternate homepages and their dedicated assets have been removed. `/home2` and `/home3` permanently redirect to `/`.

## Admin and persistence

Copy the server-only settings from `.env.example`, configure PostgreSQL and Better Auth, then run:

```sh
npm run cms:migrate
npm run cms:admin
```

For an already configured database, `npm run properties:migrate` adds development content, showing requests, specialty inquiries, and email confirmation status without changing existing listings.

- `/admin/listings`: publish listings, upload up to 50 photos per listing (JPG, PNG, or WebP, up to 20 MB each), and edit property details. The browser compresses each photo to at most 2 MB and 2400px on its longest edge before upload. The server validates and re-encodes it as WebP, strips metadata, and stores only the optimized bytes in PostgreSQL (at most 2 MB). Originals are never uploaded or persisted. Images are processed sequentially to limit memory use. The street address is always the title. Lot size is square feet; Pool and Spa are Yes/No with an unspecified option for older listings.
- `/admin/development`: add/remove projects, change their stage, and edit descriptions. The original eight projects are the initial content until the first save; saving an empty list clears the pipeline. Public project and city counts follow the saved content.
- `/admin/showings`: preferred Pacific showing times and visitor details. Requests require Ian's confirmation; they are not calendar bookings.
- `/admin/leads`: home-value requests and optional RentCast results.
- `/admin/inquiries`: inquiries from the five specialty pages.

Requests are saved before email is attempted. The private inboxes show separate broker and visitor confirmation statuses. `Accepted by email provider` records provider acceptance, not a guarantee of inbox delivery.

## Email

Email follows the SMTP.com API pattern used in `D:/Projects/trends-frontend`.

- Required: `SMTP_API` and `SMTP_CHANNEL`.
- Authenticated sender: `contactforms@citryn.com`, displayed as Mellon Real Estate.
- Notification recipients: `ianmellon@yahoo.com` and `citryn.contactforms@gmail.com`, with Reply-To set to the visitor. Both receive specialty inquiries, showing requests, and home-value requests.
- Visitor recipient: the submitted email only, with Reply-To set to Ian's Yahoo address.
- Both messages contain HTML and plain-text alternatives. The visitor email does not repeat freeform messages or financial/property details.
- The visitor confirmation is attempted only after the broker message is accepted. Confirmation failure does not cause the inquiry to be resubmitted.
- Old `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_FROM_EMAIL`, and `LEAD_EMAIL_TO` settings are not used by this API integration.

Templates: `src/lib/mail/templates.ts`. Run `npm run test:mail` to verify the API contract without sending live mail and generate reviewable HTML examples in `artifacts/email/`.

## Specialty pages and SEO

`/about-ian` introduces Ian Mellon with his original public-profile portrait, a biography based on the supplied founder bio, investment and development experience, working philosophy, and an accessible question-and-answer section. The shared Meet Ian navigation, homepage introduction, and footer link to the page. Profile copy lives in `src/lib/ian.ts` and informs the homepage introduction and development messaging. The page includes canonical/social metadata, a Person/ProfilePage schema, and a sitemap entry. Image sources and the exact prompt for the illustrative planning image are recorded in `design/about-ian-assets.json`.

All five pages share the homepage's type, logo, pink/forest/cream/gold palette, responsive navigation, and footer. Each has distinct content, an inquiry form, a generated hero image, FAQs, internal links, and an official consumer-information resource.

| URL | Main topic |
| --- | --- |
| `/pre-foreclosure-real-estate-bakersfield` | Pre-foreclosure Bakersfield; selling a house before foreclosure |
| `/probate-real-estate-bakersfield` | Probate and inherited property sales in Bakersfield |
| `/short-sale-realtor-bakersfield` | Short sale real estate in Bakersfield and Kern County |
| `/divorce-real-estate-bakersfield` | Selling a house during divorce; Bakersfield real estate services |
| `/foreclosure-property-solutions` | Notice of default property sales; distressed property solutions |

`src/lib/specialties.ts` owns the copy. Titles, descriptions, canonicals, Open Graph, and Twitter cards are server rendered. Listings have their own address-based metadata. Structured data describes the real estate business, service, breadcrumbs, and visible FAQs; it does not invent reviews, a business street address, or accreditation. Search phrases using Realtor are addressed in FAQs without asserting unverified association membership.

`/robots.txt` advertises the sitemap and excludes admin/private API routes. `/sitemap.xml` includes the homepage, listing collection, all specialties, and published listings with their actual update dates. Drafts and retired homepage URLs are excluded. The sitemap is dynamic so publication changes are reflected immediately; a database outage returns a failure instead of silently publishing an incomplete listing sitemap. Admin routes require authentication and carry noindex metadata.

Keywords appear naturally in page headings and useful copy; no meta-keyword tag is added because [Google does not use it](https://developers.google.com/search/docs/fundamentals/seo-starter-guide). Once the production deployment is live, verify the domain in Google Search Console and submit `https://mellonhomes.com/sitemap.xml`.

Generated images are stored in `public/images/specialties/`. `design/specialty-images.json` records the exact prompts and built-in ChatGPT image-generation provenance. The images are illustrative, not claims about actual listings or clients.

Copy resources: [California homeowner rights](https://oag.ca.gov/hbor), [California probate guide](https://selfhelp.courts.ca.gov/probate), [CFPB short sale explanation](https://www.consumerfinance.gov/ask-cfpb/what-is-a-short-sale-en-290/), [California property and debts in divorce](https://selfhelp.courts.ca.gov/divorce/property-debts), and [CFPB foreclosure resources](https://www.consumerfinance.gov/housing/housing-insecurity/help-for-homeowners/avoid-foreclosure/).

## Production configuration

Set `BETTER_AUTH_URL=https://mellonhomes.com` and `VALUATION_SITE_ORIGIN=https://mellonhomes.com` in the deployment. Keep local development origins in local `.env`. The latter origin setting applies to all three public forms. Only set `VALUATION_TRUSTED_IP_HEADER` to a header that the deployment proxy overwrites with the real client IP; otherwise a conservative shared request limit applies.

RentCast is optional. Without its key, home-value requests still reach the private inbox for personal review. The configured monthly cap limits application lookups.

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm run test:mail
```

For database integration tests, first run `scripts/cms-test-setup.ps1`, which uses only the disposable local PostgreSQL cluster on port 55438. Then run:

```sh
npm run test:showings
npm run test:valuation
npx playwright test --config playwright.cms.config.ts
npx playwright test
```

Browser tests use installed Chrome. Test configurations explicitly disable SMTP.com credentials and RentCast so they cannot send live emails or make paid valuation requests. The general suite uses an unconfigured database fallback; CMS tests use the isolated local database. Browser screenshots are in `.cms-test/` or existing preview directories.
