S# Clockwork Screed — Operational Platform POC

## Context

You are building a proof-of-concept operational platform for **Clockwork Screed Ltd**, a liquid floor screed and poured insulation installer based in Stockport, serving Cheshire, Greater Manchester, Merseyside, Lancashire and North Wales. They are a family-run business with 30+ years' industry experience. Key people: Daniel (technical lead), Mal (founder), Katie (admin). They currently run most of their operations on paper, email and spreadsheets — quote intake from drawings, scheduling on a wall planner, paper site sheets on the day of pour, manual invoicing.

This POC is a sales tool. It will be shown to the client to demonstrate what a digital-first operational platform could look like for their business. **It must look like a real product, not a wireframe, and every workflow must actually function end-to-end against a real database.** When the client opens it, it should already feel like a live system mid-week with realistic data already populated.

The build is to be completed in **plan mode first, then a single execution pass**, with as little human intervention as possible.

---

## Tech stack (non-negotiable)

- **Framework:** Next.js 15 (App Router, Server Actions, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui + Lucide icons
- **Database:** Neon Postgres (free tier) accessed via **Drizzle ORM**
- **File uploads:** Vercel Blob (for site photos)
- **PDF generation:** `@react-pdf/renderer` (server-side, for quotes & aftercare certificates) — PDFs open in a new tab for preview/download. **No email sending of any kind.**
- **Auth:** Single shared-password gate via middleware. Password lives in `SITE_PASSWORD` env var. Cookie-based session, 30-day expiry. No user accounts, no per-user data.
- **Deploy:** Vercel. Final step of the build is `vercel deploy --prod`. Surface the live URL at the end.

Use `pnpm` throughout.

---

## Brand & visual direction

Clockwork Screed are a construction trade business — clean, confident, professional. Not toy-looking, not consumer-app-y, not pastel. Think Procore, Buildertrend, or modern construction SaaS.

- **Primary:** deep slate `#1e293b` (slate-800)
- **Accent:** amber `#f59e0b` (amber-500) — used sparingly, for CTAs and key highlights, evoking wet screed / construction signage
- **Surfaces:** white / `#f8fafc` (slate-50) with `#e2e8f0` (slate-200) borders
- **Typography:** Inter for UI, JetBrains Mono for numerical data (m², m³, batch refs, £)
- **Logo:** simple wordmark `Clockwork Screed` in slate-800 with a small amber square accent — generate as an inline SVG component, not an image file
- **Tone:** confident, plainspoken, trade-literate. Buttons say "Schedule pour" not "Create new event".

Density: information-dense like a trade tool, not airy like a marketing site. Real workers use this on a phone on a building site in the rain — buttons must be thumbable, text must be readable in sunlight.

---

## Data model (Drizzle schema)

```
contacts          — id, name, company, role (self-builder | developer | main contractor | architect), email, phone, notes, createdAt
sites             — id, contactId, addressLine1, addressLine2, town, postcode, accessNotes, createdAt
enquiries         — id, siteId, contactId, projectType (new build | extension | refurb | commercial), screedType, targetDate, areaM2, depthMm, notes, source, status (new | quoted | won | lost), createdAt
quotes            — id, enquiryId, quoteNumber (CWS-YYYY-####), status (draft | sent | accepted | declined), subtotal, vat, total, validUntil, sentAt, acceptedAt, pdfUrl, createdAt
quoteLines        — id, quoteId, description, qty, unit (m² | m³ | day | item), unitPrice, lineTotal, sortOrder
jobs              — id, quoteId, siteId, contactId, jobNumber (CWS-J-YYYY-####), scheduledDate, crewId, truckId, screedType, areaM2, depthMm, volumeM3, status (scheduled | in_progress | completed | cancelled), createdAt
crews             — id, name, leadName, active
trucks            — id, registration, name, capacityM3, active
pourRecords       — id, jobId, actualAreaM2, actualDepthMm, actualVolumeM3, screedType, batchRef, ambientTempC, conditions (sunny | cloudy | rain | cold | hot), preCheckUfhPressure, preCheckEdgeInsulation, preCheckDpm, preCheckAccess, preCheckWaterPower, photos (text[] of Blob URLs), customerSignatureName, customerSignatureDataUrl, signedAt, notes, completedAt
invoices          — id, jobId, invoiceNumber (CWS-INV-YYYY-####), subtotal, vat, total, status (draft | sent | paid | overdue), dueDate, paidAt, createdAt
```

Use `pgEnum` for status fields. All `createdAt` default `now()`. UUIDs for primary keys.

---

## Features & routes

### `/login` — password gate
Single password field. POST to a Server Action that sets an httpOnly cookie if password matches `SITE_PASSWORD`. Middleware protects all other routes and redirects to `/login`.

### `/` — dashboard
KPI tiles (this week / this month):
- New enquiries
- Quoted value (£)
- Won value (£)
- m² poured this month
- Upcoming pours (next 7 days, list)
- Outstanding invoices (£ and count)

Recent activity feed: latest 10 events across enquiries/quotes/jobs/invoices.

### `/enquiries` — list + create
Table: contact, site, project type, target date, area, status. Filter by status. "+ New enquiry" opens a modal with full intake form. On submit, auto-suggests a quote with sensible default line items based on screed type and area.

### `/enquiries/[id]` — detail
Full enquiry detail. Button: "Generate quote" → creates a draft quote pre-populated from enquiry data.

### `/quotes` — list
Table: quote number, contact, site, total, status, sent date. Filter by status.

### `/quotes/[id]` — quote builder
Edit line items (add/remove/reorder, qty × unit price = line total, auto VAT 20%, auto total).
Buttons:
- **"Preview PDF"** — generates and opens the branded quote PDF in a new tab
- **"Mark as sent"** — updates status to `sent`, sets `sentAt` timestamp, toast: "Quote marked as sent". Also surfaces a "Download PDF" link the user can manually send to the customer themselves
- **"Mark accepted"** → creates a Job from this quote
- **"Mark declined"**

No email is sent automatically by the system. The user downloads/views the PDF and sends it via their own email client.

### `/jobs` — list
Table: job number, site, scheduled date, crew, truck, screed type, m², status. Filter by status and date range.

### `/jobs/[id]` — job detail + site sheet
Top section: job metadata (read-only summary).
Big primary button on mobile: **"Start pour record"** → opens `/jobs/[id]/pour` (mobile-optimised flow).

### `/jobs/[id]/pour` — mobile site sheet (this is the showcase)
Stepper UI, optimised for one-thumb use on a phone on site:
1. **Pre-pour checks** — 5 toggle switches (UFH pressure tested, edge insulation, DPM, access, water/power). All must be on to proceed, or supervisor override with a reason.
2. **Pour data** — actual m², actual depth (mm), screed type (preset from job, editable), batch ref, ambient temp (number input), conditions (chip selector).
3. **Photos** — upload up to 8 photos (Vercel Blob), shows thumbnails.
4. **Customer sign-off** — customer name field + signature canvas (`react-signature-canvas`), saves as data URL.
5. **Complete** — POSTs pour record, marks job `completed`. Confirmation screen shows: "Pour record saved" + an inline preview of the aftercare PDF + a prominent "Download Aftercare Certificate" button. The customer can be handed the phone to view the certificate on-screen, or the user can download and share it themselves. **No email is sent.**

### `/schedule` — week view
Kanban-style or calendar grid showing pours by crew, columns = days of the current week, rows = crews. Jobs render as cards (site, area, screed type). Navigate prev/next week. Click a card to open the job.

### `/contacts` — directory
List + create + detail. Detail shows job history and total £ done.

### `/invoices` — list + detail
List with status filter. Detail shows line items pulled from the job. "Mark sent" / "Mark paid". Generate PDF (preview/download only, no email).

### `/settings` — light settings page
Crews CRUD, Trucks CRUD, screed type catalog (name, default £/m², default depth).

---

## Seed data (critical for demo polish)

Create a `pnpm seed` script that populates the DB with **realistic Cheshire/Manchester construction industry data**, so when the client opens the deployed app it already feels alive:

- **15 contacts** mixing self-builders (private names), developers (e.g. "Redrow Homes North West", "Anwyl Homes Cheshire", "PH Homes"), main contractors (e.g. "Seddon Construction", "Tyson Construction", "Russell Homes"), architects (e.g. "Calderpeel Architects", "AEW Architects"). Use plausible North West postcodes (WA, SK, CH, M, L, WN).
- **20 sites** across Knutsford (WA16), Alderley Edge (SK9), Wilmslow (SK9), Hale (WA15), Lymm (WA13), Warrington (WA1-WA5), Northwich (CW9), Chester (CH1-CH4), Macclesfield (SK10), Manchester suburbs.
- **3 crews**: "Crew A — Daniel", "Crew B — Mal", "Crew C — Sub".
- **2 trucks**: "Transmix 01" (reg `MX22 ABC`), "Transmix 02" (reg `MX23 DEF`).
- **Screed type catalog**: Cemfloor Therm (£18/m² @ 50mm), Cemfloor NH (£16/m² @ 50mm), Energystore TLA poured insulation (£22/m² @ 100mm). These are the real products Clockwork Screed use.
- **Enquiries**: 8, spread across statuses (3 new, 3 quoted, 1 won, 1 lost).
- **Quotes**: 6 with realistic line items, mix of statuses.
- **Jobs**: 12 — 3 completed (with full pour records and signatures), 4 scheduled this week, 3 scheduled next week, 2 in progress.
- **Pour records on completed jobs**: realistic batch refs (e.g. `CFT-20260512-001`), ambient temps 8-22°C, mix of conditions, 2-4 photo URLs each (use placeholder image services if Blob upload isn't seeded — but real Blob is better).
- **Invoices**: tied to completed jobs, mix of paid/sent/overdue.

Areas should range from 45 m² (small extension) to 1,200 m² (commercial). Quote totals should range from ~£1,200 to ~£32,000 + VAT. Make the numbers feel real.

---

## Polish requirements

These are what separate "demo" from "real":

1. **Empty states** — every list has a thoughtful empty state with a CTA. But because of seed data the user shouldn't hit any on first load.
2. **Loading states** — skeleton loaders on all tables, never a flash of nothing.
3. **Optimistic UI** — toggling status, creating records should feel instant (Server Actions with `useOptimistic`).
4. **Form validation** — Zod schemas on every Server Action input, friendly error messages.
5. **Mobile** — `/jobs/[id]/pour` is the marquee mobile flow; treat it like a native app. Test thumb reach. Big touch targets (min 48px). Sticky bottom CTA bar.
6. **PDFs** — branded letterhead, real-looking quote and aftercare certificate. Aftercare PDF must include: drying times by depth, when UFH can be turned on (slow ramp schedule), when finished flooring can be laid, warranty terms. This is genuinely useful content.
7. **Numbers** — always format with `Intl.NumberFormat` (£ with commas, m² with comma thousands). Use mono font for numbers.
8. **Dates** — UK format throughout (`d MMM yyyy`, e.g. `15 May 2026`). Use `date-fns`.
9. **Toasts** — `sonner` for action feedback ("Quote marked as sent", "Pour record saved").
10. **Keyboard** — `cmd+k` command palette (`cmdk`) to jump between any contact, job, quote.

---

## Build approach

1. **Plan mode first.** Lay out the full file tree, schema, and route map before writing code. Confirm the plan internally then proceed.
2. **Schema and seed first.** Get the DB shape right, get seed data flowing, before any UI.
3. **Build server-side first** for each feature (Server Actions, data fetches), then UI.
4. **shadcn/ui components.** Install only what you use. Don't hand-roll dialogs, tables, etc.
5. **Don't pause to ask.** Make decisions and move. If genuinely blocked on something outside the brief, leave a clear `// TODO:` and continue.
6. **Final step: deploy.** Push to a fresh GitHub repo (`clockwork-screed-poc`), connect to Vercel, set env vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BLOB_READ_WRITE_TOKEN`, `SITE_PASSWORD`), run migrations against Neon, run seed against production DB, deploy to prod, return the live URL and the password.

---

## Environment variables required

```
DATABASE_URL=                # Neon Postgres connection string (pooled)
DATABASE_URL_UNPOOLED=       # Neon Postgres direct connection (for migrations)
BLOB_READ_WRITE_TOKEN=       # Vercel Blob (for pour record photo uploads)
SITE_PASSWORD=               # Shared password for the login gate
```

If any of these are missing at build start, stop and ask the user for them before continuing. Don't fake them.

---

## Acceptance criteria — the build is done when:

- [ ] `pnpm dev` runs locally with no errors
- [ ] Login gate works, wrong password rejected, right password sets cookie
- [ ] Dashboard shows realistic KPIs from seeded data
- [ ] Can create an enquiry → generate a quote → preview PDF → mark accepted → see a job appear → open it on mobile → complete the full pour record flow including signature → see the aftercare PDF preview on screen
- [ ] Schedule view shows the seeded jobs across the current and next week
- [ ] All list pages have working filters
- [ ] Mobile pour flow is genuinely thumb-usable (test at 375px viewport)
- [ ] Deployed to Vercel production, URL returned
- [ ] README at repo root with: live URL, password, how to reseed, how to reset, what's stubbed vs real (note explicitly: no emails are sent — PDFs are preview/download only)

When complete, output:

```
LIVE URL: https://...
PASSWORD: ...
GITHUB:   https://github.com/...
```

Now plan, then build. Go.
