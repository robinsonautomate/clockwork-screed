# Clockwork Screed — Operations Platform

A proof-of-concept digital operations platform for **Clockwork Screed Ltd**, a
liquid floor screed and poured insulation installer based in Stockport. It
covers the full operational flow — enquiry intake, quoting, scheduling, the
on-site pour record, and invoicing — end-to-end against a real database.

This is a **sales-demo build**: it looks and behaves like a live product and
opens already populated with realistic Cheshire / Greater Manchester
construction data.

---

## Live demo

| | |
|---|---|
| **Live URL** | https://clockwork-screed.vercel.app |
| **Password** | `Screed2026` |
| **GitHub** | https://github.com/robinsonautomate/clockwork-screed |

The whole site sits behind a single shared-password gate. Enter the password
above on the login screen.

---

## What it does

- **Dashboard** — KPIs (new enquiries, quoted/won value, m² poured, outstanding
  invoices), upcoming pours and a live activity feed.
- **Enquiries** — intake form (contact + site + project); each enquiry suggests
  a quote with sensible default line items.
- **Quotes** — line-item builder with auto VAT and totals; branded PDF;
  status flow `draft → sent → accepted`. Accepting a quote creates a job.
- **Jobs & Schedule** — job list with filters, a week-view schedule by crew,
  and crew/truck/date assignment.
- **Pour record** — `/jobs/[id]/pour` is the marquee mobile flow: a 5-step
  site sheet (pre-pour checks, pour data, photos, customer signature, review)
  that completes the job and produces an aftercare certificate.
- **Invoices** — raised automatically when a pour completes; branded PDF;
  `draft → sent → paid`.
- **Contacts** — directory with job history and total value.
- **Settings** — crews, trucks and the screed-type catalog.
- **⌘K** command palette to jump to any record.

---

## Tech stack

- **Next.js 16** (App Router, Server Actions, TypeScript) — the brief specified
  Next 15; this uses the current Next 16, which is API-compatible for
  everything here.
- **Tailwind CSS v4** + **shadcn/ui** + **Lucide** icons
- **Neon Postgres** via **Drizzle ORM**
- **Vercel Blob** for pour-record photo uploads
- **@react-pdf/renderer** for quote / invoice / aftercare PDFs
- **Vercel** hosting · `pnpm` throughout

---

## Local development

Requires Node 20+ and `pnpm`.

```bash
pnpm install
cp env.example .env.local      # contains the working credentials
pnpm db:migrate                # apply the schema to Neon
pnpm seed                      # populate realistic demo data
pnpm dev                       # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres — pooled (app runtime) |
| `DATABASE_URL_UNPOOLED` | Neon Postgres — direct (migrations) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — pour photo uploads |
| `SITE_PASSWORD` | Shared password for the login gate |

## Reseed / reset

`pnpm seed` is **idempotent** — it truncates the app's tables and rebuilds the
full demo dataset every run. Use it both to reseed and to reset to a clean
state:

```bash
pnpm seed          # wipe + repopulate the demo data
pnpm db:migrate    # re-apply the schema (safe to run repeatedly)
```

The deployed app shares the same Neon database, so a local `pnpm seed` also
refreshes the live demo.

## Database isolation

The brief stated the Neon database would be empty. It was not — it already
hosted an unrelated project in the `public` schema. To avoid touching that
data, **this app lives entirely in its own `clockwork` Postgres schema**. The
`public` schema is left untouched.

---

## What's real vs. illustrative

**Real and fully functional**

- Every workflow runs end-to-end against the live Neon Postgres database.
- Quote, invoice and aftercare-certificate PDFs are generated server-side.
- Pour-record photos upload to Vercel Blob from the live pour flow.
- Customer signatures are captured on a real signature pad.
- The login gate, all CRUD, filtering and status transitions are real.

**Illustrative / stubbed**

- **No emails are sent — by design.** PDFs are preview/download only; the user
  downloads a quote, invoice or certificate and sends it from their own email
  client.
- Authentication is a single shared password — there are no user accounts.
- Seeded pour-record photos use placeholder images (`picsum.photos`); photos
  taken in the live pour flow are real uploads.
- Seeded customer signatures are generated SVGs; signatures captured in the app
  are real PNGs.
- Company registration and bank details shown on PDFs are placeholder values
  for the demo.

---

*Proof of concept — built as a sales demonstration for Clockwork Screed Ltd.*
