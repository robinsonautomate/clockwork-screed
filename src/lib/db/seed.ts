/**
 * Seed script — realistic Cheshire / Greater Manchester screed-industry data.
 * Run with: pnpm seed
 *
 * Re-runnable: truncates the clockwork schema first, so it always produces a
 * clean, consistent dataset.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "./index";
import * as s from "./schema";

/* ── helpers ──────────────────────────────────────────────────────────── */

const TODAY = new Date("2026-05-15T09:00:00.000Z");

const dec = (n: number) => n.toFixed(2);
const pad4 = (n: number) => String(n).padStart(4, "0");

/** date-only string YYYY-MM-DD */
function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}
function at(dateString: string, hour = 10, minute = 30): Date {
  return new Date(`${dateString}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
}

/** Stylised handwritten-looking signature as an inline SVG data URL. */
function signatureDataUrl(name: string): string {
  const seed = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const j = (i: number) => ((seed * (i + 3)) % 17) - 8;
  const d = `M 18 ${74 + j(1)} C 46 ${30 + j(2)}, 70 ${104 + j(3)}, 96 ${62 + j(4)} ` +
    `S 142 ${30 + j(5)}, 172 ${78 + j(6)} S 224 ${100 + j(7)}, 262 ${50 + j(8)} ` +
    `S 312 ${92 + j(9)}, 348 ${60 + j(2)}`;
  const flourish = `M 26 ${96 + j(4)} q 150 ${20 + j(3)}, 320 ${-6 + j(5)}`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='372' height='128' viewBox='0 0 372 128'>` +
    `<rect width='372' height='128' fill='white'/>` +
    `<path d='${d}' fill='none' stroke='#0f172a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/>` +
    `<path d='${flourish}' fill='none' stroke='#0f172a' stroke-width='1.6' stroke-linecap='round'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const photo = (s1: string) => `https://picsum.photos/seed/${s1}/1200/900`;

/* ── static catalog data ─────────────────────────────────────────────── */

const SCREED = {
  therm: "Cemfloor Therm",
  nh: "Cemfloor NH",
  tla: "Energystore TLA poured insulation",
};

const screedTypeRows = [
  { name: SCREED.therm, defaultPricePerM2: "18.00", defaultDepthMm: 50, active: true },
  { name: SCREED.nh, defaultPricePerM2: "16.00", defaultDepthMm: 50, active: true },
  { name: SCREED.tla, defaultPricePerM2: "22.00", defaultDepthMm: 100, active: true },
];

const crewRows = [
  { name: "Crew A — Daniel", leadName: "Daniel Ashworth", active: true },
  { name: "Crew B — Mal", leadName: "Mal Ashworth", active: true },
  { name: "Crew C — Sub", leadName: "Sub-contract crew", active: true },
];

const truckRows = [
  { registration: "MX22 ABC", name: "Transmix 01", capacityM3: "8.00", active: true },
  { registration: "MX23 DEF", name: "Transmix 02", capacityM3: "8.00", active: true },
];

const SCREED_PRICE: Record<string, number> = {
  [SCREED.therm]: 18,
  [SCREED.nh]: 16,
  [SCREED.tla]: 22,
};

/* ── contacts (15) ───────────────────────────────────────────────────── */

const contactRows: (typeof s.contacts.$inferInsert)[] = [
  { name: "James & Laura Pennington", role: "self-builder", email: "jlpennington@outlook.com", phone: "07712 884512", notes: "Self-build family home. Prefers WhatsApp for site updates." },
  { name: "Mark Holroyd", role: "self-builder", email: "mark.holroyd@gmail.com", phone: "07820 119043", notes: null },
  { name: "Priya & Sanjay Rana", role: "self-builder", email: "rana.family@gmail.com", phone: "07533 660218", notes: "New build — architect-led. Decisions via Calderpeel." },
  { name: "Tom Caldwell", role: "self-builder", email: "tomcaldwell89@gmail.com", phone: "07901 552746", notes: null },
  { name: "Elaine Whitworth", role: "self-builder", email: "e.whitworth@btinternet.com", phone: "07468 203991", notes: "Barn conversion, large UFH zone." },
  { name: "David Ellison", role: "self-builder", email: "davidellison@me.com", phone: "07795 410338", notes: "Repeat customer — 2nd project with us." },
  { name: "Sarah Kearns", company: "Redrow Homes North West", role: "developer", email: "s.kearns@redrow.co.uk", phone: "0161 240 8800", notes: "Framework developer. PO required before pour." },
  { name: "Gareth Pugh", company: "Anwyl Homes Cheshire", role: "developer", email: "g.pugh@anwylhomes.co.uk", phone: "01244 525050", notes: "Plot-by-plot scheduling, calls Thursdays." },
  { name: "Nick Bramall", company: "PH Homes", role: "developer", email: "nick@ph-homes.co.uk", phone: "0161 928 4471", notes: null },
  { name: "Helen Astley", company: "Jones Homes", role: "developer", email: "h.astley@joneshomes.co.uk", phone: "01625 540000", notes: "Prestige plots — high spec, snagging sensitive." },
  { name: "Andrew Royle", company: "Seddon Construction", role: "main contractor", email: "a.royle@seddon.co.uk", phone: "0161 920 4000", notes: "14-day payment terms. RAMS required for every site." },
  { name: "Lee Tyson", company: "Tyson Construction", role: "main contractor", email: "lee@tysonconstruction.co.uk", phone: "01928 711204", notes: null },
  { name: "Michael Russell", company: "Russell Homes", role: "main contractor", email: "m.russell@russellhomes.co.uk", phone: "0161 764 2228", notes: "Small extensions programme, flexible dates." },
  { name: "Joanne Calder", company: "Calderpeel Architects", role: "architect", email: "jcalder@calderpeel.co.uk", phone: "0161 833 9555", notes: "Specifies us on residential & education projects." },
  { name: "Paul Edwards", company: "AEW Architects", role: "architect", email: "p.edwards@aewarchitects.com", phone: "0161 832 2222", notes: "Referral source — commercial fit-outs." },
];

/* ── sites (20) — index → contact index ──────────────────────────────── */

type SiteDef = {
  _contact: number;
  addressLine1: string;
  addressLine2?: string | null;
  town: string;
  postcode: string;
  accessNotes: string | null;
};
const siteDefs: SiteDef[] = [
  { _contact: 0, addressLine1: "Plot 2, Mobberley Road", town: "Knutsford", postcode: "WA16 8GA", accessNotes: "Narrow lane — transfer pump required, no artic access." },
  { _contact: 1, addressLine1: "14 Davey Lane", town: "Alderley Edge", postcode: "SK9 7NU", accessNotes: "Driveway parking for one vehicle only." },
  { _contact: 2, addressLine1: "The Coach House, Hawthorn Lane", town: "Wilmslow", postcode: "SK9 1AF", accessNotes: null },
  { _contact: 3, addressLine1: "7 Broomfield Lane", town: "Hale", postcode: "WA15 9AP", accessNotes: "Pump run approx 35m to rear extension." },
  { _contact: 4, addressLine1: "Rushgreen Barn, Rushgreen Road", town: "Lymm", postcode: "WA13 9PT", accessNotes: "Hardcore track — check ground conditions in wet weather." },
  { _contact: 5, addressLine1: "23 Longbarn Lane", town: "Warrington", postcode: "WA2 0TX", accessNotes: null },
  { _contact: 6, addressLine1: "Phase 3, Tabley Gardens", town: "Knutsford", postcode: "WA16 0PE", accessNotes: "Report to site cabin, sign in with Redrow site manager." },
  { _contact: 6, addressLine1: "Plots 41–58, Saxon Fields", town: "Northwich", postcode: "CW9 8AB", accessNotes: "Compound off main entrance. Hi-vis & boots." },
  { _contact: 6, addressLine1: "Hartford Grange, Chester Road", town: "Northwich", postcode: "CW8 1LP", accessNotes: "Pour plots in numerical order, liaise with site agent." },
  { _contact: 7, addressLine1: "The Sidings, Station Road", town: "Macclesfield", postcode: "SK10 2AA", accessNotes: "Town-centre site — deliveries before 09:30." },
  { _contact: 7, addressLine1: "Weaver Park, London Road", town: "Northwich", postcode: "CW9 5HX", accessNotes: null },
  { _contact: 8, addressLine1: "5 Mottram Road", town: "Alderley Edge", postcode: "SK9 7HX", accessNotes: "Restricted parking — pump within 40m of pour." },
  { _contact: 8, addressLine1: "Carrwood Mews, Carrwood Road", town: "Wilmslow", postcode: "SK9 5DW", accessNotes: "Private road, gated — code from site office." },
  { _contact: 9, addressLine1: "Pheasant Walk, Tarporley Road", town: "Chester", postcode: "CH3 9AA", accessNotes: "Show-home plots first. Protect completed driveways." },
  { _contact: 9, addressLine1: "Meadow View, Whitley Lane", town: "Warrington", postcode: "WA4 4QP", accessNotes: null },
  { _contact: 10, addressLine1: "Unit 4, Stretton Distribution Park", town: "Warrington", postcode: "WA4 4TQ", accessNotes: "Large industrial floor — phased pour, banksman on site." },
  { _contact: 10, addressLine1: "Lymm Health Centre, Bridgewater Street", town: "Lymm", postcode: "WA13 0AB", accessNotes: "Live building — out-of-hours pour, security let-in." },
  { _contact: 11, addressLine1: "Daresbury Innovation Centre, Keckwick Lane", town: "Warrington", postcode: "WA4 4FS", accessNotes: "Induction required. Permit-to-work system." },
  { _contact: 12, addressLine1: "12 Park Lane", town: "Macclesfield", postcode: "SK11 8AA", accessNotes: null },
  { _contact: 13, addressLine1: "Heald Green Primary School, Outwood Road", town: "Manchester", postcode: "M22 4FW", accessNotes: "Education site — DBS-checked operatives, pour during half-term." },
];

/* ── enquiries (20) — index → site index (1:1) ───────────────────────── */

type EnqDef = {
  projectType: s.ProjectType;
  screedType: string;
  areaM2: number;
  depthMm: number;
  status: s.EnquiryStatus;
  source: string;
  notes: string | null;
};
const enquiryDefs: EnqDef[] = [
  { projectType: "extension", screedType: SCREED.therm, areaM2: 78, depthMm: 65, status: "new", source: "Website enquiry", notes: "Rear kitchen extension with wet UFH. Wants pour after plastering." },
  { projectType: "refurb", screedType: SCREED.nh, areaM2: 52, depthMm: 50, status: "new", source: "Checkatrade", notes: "Ground-floor refurb, existing slab — bonded screed." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 145, depthMm: 65, status: "new", source: "Referral — Calderpeel Architects", notes: "Full ground floor, single zone UFH." },
  { projectType: "extension", screedType: SCREED.therm, areaM2: 64, depthMm: 60, status: "quoted", source: "Phone call", notes: "Garden room + utility. Tight access to rear." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 210, depthMm: 70, status: "quoted", source: "Repeat customer", notes: "Barn conversion, two UFH zones." },
  { projectType: "extension", screedType: SCREED.nh, areaM2: 45, depthMm: 50, status: "quoted", source: "Recommendation", notes: "Small single-storey extension." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 320, depthMm: 65, status: "lost", source: "Developer framework", notes: "Lost on price — client used existing supplier." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 880, depthMm: 65, status: "lost", source: "Developer framework", notes: "Programme clash — could not meet their pour window." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 540, depthMm: 65, status: "won", source: "Developer framework", notes: "Phase 1 plots, framework rates." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 260, depthMm: 65, status: "won", source: "Developer framework", notes: null },
  { projectType: "new build", screedType: SCREED.nh, areaM2: 185, depthMm: 50, status: "won", source: "Developer framework", notes: "Apartments — bonded screed to concrete deck." },
  { projectType: "refurb", screedType: SCREED.therm, areaM2: 96, depthMm: 60, status: "won", source: "Repeat customer", notes: "High-spec refurb, retrofit UFH." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 320, depthMm: 65, status: "won", source: "Website enquiry", notes: "Gated development, 4 large plots." },
  { projectType: "new build", screedType: SCREED.therm, areaM2: 410, depthMm: 65, status: "won", source: "Developer framework", notes: "Show-home plots prioritised." },
  { projectType: "new build", screedType: SCREED.nh, areaM2: 230, depthMm: 50, status: "won", source: "Developer framework", notes: null },
  { projectType: "commercial", screedType: SCREED.tla, areaM2: 1150, depthMm: 100, status: "won", source: "Main contractor framework", notes: "Industrial unit — poured insulation, phased over two days." },
  { projectType: "commercial", screedType: SCREED.therm, areaM2: 480, depthMm: 75, status: "won", source: "Main contractor framework", notes: "Healthcare fit-out, out-of-hours pour." },
  { projectType: "commercial", screedType: SCREED.therm, areaM2: 720, depthMm: 75, status: "won", source: "Referral — AEW Architects", notes: "Innovation centre, open-plan floor." },
  { projectType: "extension", screedType: SCREED.therm, areaM2: 88, depthMm: 65, status: "won", source: "Main contractor framework", notes: "Two-storey side extension." },
  { projectType: "commercial", screedType: SCREED.tla, areaM2: 640, depthMm: 100, status: "won", source: "Referral — Calderpeel Architects", notes: "Primary school hall & classrooms, half-term pour." },
];

/* ── job scheduling (12 jobs ← won enquiries 8..19) ──────────────────── */

type JobPlan = { scheduledDate: string; status: s.JobStatus; crew: number; truck: number };
const jobPlans: JobPlan[] = [
  { scheduledDate: "2026-04-22", status: "completed", crew: 0, truck: 0 },
  { scheduledDate: "2026-05-12", status: "completed", crew: 1, truck: 1 },
  { scheduledDate: "2026-05-13", status: "completed", crew: 0, truck: 0 },
  { scheduledDate: "2026-05-14", status: "in_progress", crew: 2, truck: 1 },
  { scheduledDate: "2026-05-15", status: "in_progress", crew: 0, truck: 0 },
  { scheduledDate: "2026-05-18", status: "scheduled", crew: 1, truck: 1 },
  { scheduledDate: "2026-05-19", status: "scheduled", crew: 0, truck: 0 },
  { scheduledDate: "2026-05-20", status: "scheduled", crew: 2, truck: 1 },
  { scheduledDate: "2026-05-21", status: "scheduled", crew: 1, truck: 0 },
  { scheduledDate: "2026-05-25", status: "scheduled", crew: 0, truck: 1 },
  { scheduledDate: "2026-05-27", status: "scheduled", crew: 1, truck: 0 },
  { scheduledDate: "2026-05-29", status: "scheduled", crew: 2, truck: 1 },
];

/* ── quote-line builder ──────────────────────────────────────────────── */

type LineSpec = { description: string; qty: number; unit: s.QuoteLineUnit; unitPrice: number };

function buildQuoteLines(
  screedType: string,
  areaM2: number,
  depthMm: number,
  projectType: s.ProjectType,
): LineSpec[] {
  const price = SCREED_PRICE[screedType] ?? 18;
  const lines: LineSpec[] = [
    {
      description: `${screedType} — supplied & pumped, ${depthMm}mm`,
      qty: areaM2,
      unit: "m²",
      unitPrice: price,
    },
    { description: "Perimeter edge insulation strip", qty: areaM2, unit: "m²", unitPrice: 0.75 },
    { description: "Polythene damp-proof / separating membrane", qty: areaM2, unit: "m²", unitPrice: 1.2 },
    {
      description: "Site mobilisation & line pump set-up",
      qty: 1,
      unit: "item",
      unitPrice: areaM2 < 150 ? 295 : areaM2 < 500 ? 385 : 495,
    },
  ];
  if (areaM2 > 400 || projectType === "commercial") {
    lines.push({ description: "Floor profile survey & moisture readings", qty: 1, unit: "item", unitPrice: 185 });
  }
  if (screedType === SCREED.therm) {
    lines.push({ description: "UFH pressure-test witness & sign-off", qty: 1, unit: "item", unitPrice: 120 });
  }
  if (areaM2 > 700) {
    lines.push({ description: "Phased pour — additional crew day", qty: 1, unit: "day", unitPrice: 540 });
  }
  return lines;
}

/* ── main ────────────────────────────────────────────────────────────── */

async function main() {
  console.log("Seeding clockwork schema…");

  await db.execute(sql`
    truncate table
      clockwork.invoice_lines, clockwork.invoices, clockwork.pour_records,
      clockwork.jobs, clockwork.quote_lines, clockwork.quotes,
      clockwork.enquiries, clockwork.sites, clockwork.contacts,
      clockwork.screed_types, clockwork.crews, clockwork.trucks
    restart identity cascade
  `);

  const screedTypes = await db.insert(s.screedTypes).values(screedTypeRows).returning({ id: s.screedTypes.id });
  const crews = await db.insert(s.crews).values(crewRows).returning({ id: s.crews.id });
  const trucks = await db.insert(s.trucks).values(truckRows).returning({ id: s.trucks.id });
  console.log(`  catalog: ${screedTypes.length} screed types, ${crews.length} crews, ${trucks.length} trucks`);

  const contacts = await db.insert(s.contacts).values(contactRows).returning({ id: s.contacts.id });
  console.log(`  ${contacts.length} contacts`);

  const sites = await db
    .insert(s.sites)
    .values(siteDefs.map((d) => ({
      contactId: contacts[d._contact].id,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      town: d.town,
      postcode: d.postcode,
      accessNotes: d.accessNotes,
    })))
    .returning({ id: s.sites.id });
  console.log(`  ${sites.length} sites`);

  /* enquiries — 1:1 with sites */
  const enquiryRows = enquiryDefs.map((d, i) => {
    const contactIdx = siteDefs[i]._contact;
    // target date: won → near the job date; others → weeks out
    let targetDate: string;
    if (d.status === "won") {
      targetDate = jobPlans[i - 8].scheduledDate;
    } else {
      targetDate = dateStr(addDays(TODAY, 21 + (i % 5) * 14));
    }
    let createdAt: Date;
    if (d.status === "won") {
      createdAt = at(jobPlans[i - 8].scheduledDate, 9, 0);
      createdAt = addDays(createdAt, -(34 + (i % 4) * 5));
    } else if (d.status === "new") {
      createdAt = addDays(TODAY, -(2 + i * 3));
    } else {
      createdAt = addDays(TODAY, -(24 + i * 4));
    }
    return {
      siteId: sites[i].id,
      contactId: contacts[contactIdx].id,
      projectType: d.projectType,
      screedType: d.screedType,
      targetDate,
      areaM2: dec(d.areaM2),
      depthMm: d.depthMm,
      notes: d.notes,
      source: d.source,
      status: d.status,
      createdAt,
    };
  });
  const enquiries = await db.insert(s.enquiries).values(enquiryRows).returning({ id: s.enquiries.id });
  console.log(`  ${enquiries.length} enquiries`);

  /* quotes — for enquiries 3..19 (quoted / lost / won) */
  let quoteSeq = 0;
  const quotePayloads: {
    enquiryIdx: number;
    status: s.QuoteStatus;
    lines: LineSpec[];
    subtotal: number;
    vat: number;
    total: number;
    createdAt: Date;
    sentAt: Date | null;
    acceptedAt: Date | null;
    validUntil: string;
    number: string;
  }[] = [];

  for (let i = 3; i < 20; i++) {
    const d = enquiryDefs[i];
    const status: s.QuoteStatus =
      d.status === "won" ? "accepted" : d.status === "lost" ? "declined" : i === 5 ? "draft" : "sent";
    const lines = buildQuoteLines(d.screedType, d.areaM2, d.depthMm, d.projectType);
    const subtotal = lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
    const vat = subtotal * 0.2;
    const total = subtotal + vat;

    const enqCreated = enquiryRows[i].createdAt;
    const createdAt = addDays(enqCreated, 3 + (i % 3));
    const sentAt = status === "draft" ? null : addDays(createdAt, 1);
    const acceptedAt = status === "accepted" ? addDays(createdAt, 8 + (i % 4)) : null;
    quoteSeq += 1;
    quotePayloads.push({
      enquiryIdx: i,
      status,
      lines,
      subtotal,
      vat,
      total,
      createdAt,
      sentAt,
      acceptedAt,
      validUntil: dateStr(addDays(createdAt, 30)),
      number: `CWS-2026-${pad4(quoteSeq)}`,
    });
  }

  const quotes = await db
    .insert(s.quotes)
    .values(quotePayloads.map((q) => ({
      enquiryId: enquiries[q.enquiryIdx].id,
      quoteNumber: q.number,
      status: q.status,
      subtotal: dec(q.subtotal),
      vat: dec(q.vat),
      total: dec(q.total),
      validUntil: q.validUntil,
      sentAt: q.sentAt,
      acceptedAt: q.acceptedAt,
      createdAt: q.createdAt,
    })))
    .returning({ id: s.quotes.id });
  console.log(`  ${quotes.length} quotes`);

  /* quote lines */
  const lineRows = quotePayloads.flatMap((q, qi) =>
    q.lines.map((l, li) => ({
      quoteId: quotes[qi].id,
      description: l.description,
      qty: dec(l.qty),
      unit: l.unit,
      unitPrice: dec(l.unitPrice),
      lineTotal: dec(l.qty * l.unitPrice),
      sortOrder: li,
    })),
  );
  await db.insert(s.quoteLines).values(lineRows);
  console.log(`  ${lineRows.length} quote lines`);

  /* jobs — from the 12 accepted quotes (enquiries 8..19) */
  const acceptedQuoteIdxByEnquiry = new Map<number, number>();
  quotePayloads.forEach((q, qi) => {
    if (q.status === "accepted") acceptedQuoteIdxByEnquiry.set(q.enquiryIdx, qi);
  });

  const jobRows = jobPlans.map((plan, j) => {
    const enqIdx = 8 + j;
    const d = enquiryDefs[enqIdx];
    const qi = acceptedQuoteIdxByEnquiry.get(enqIdx)!;
    const volume = (d.areaM2 * d.depthMm) / 1000;
    return {
      quoteId: quotes[qi].id,
      siteId: sites[enqIdx].id,
      contactId: contacts[siteDefs[enqIdx]._contact].id,
      jobNumber: `CWS-J-2026-${pad4(j + 1)}`,
      scheduledDate: plan.scheduledDate,
      crewId: crews[plan.crew].id,
      truckId: trucks[plan.truck].id,
      screedType: d.screedType,
      areaM2: dec(d.areaM2),
      depthMm: d.depthMm,
      volumeM3: dec(volume),
      status: plan.status,
      createdAt: quotePayloads[qi].acceptedAt ?? quotePayloads[qi].createdAt,
    };
  });
  const jobs = await db.insert(s.jobs).values(jobRows).returning({ id: s.jobs.id });
  console.log(`  ${jobs.length} jobs`);

  /* pour records — completed jobs 0,1,2 */
  const completedJobIdx = [0, 1, 2];
  const pourMeta = [
    { temp: 11, conditions: "cloudy" as s.PourConditions, batch: "014" },
    { temp: 16, conditions: "sunny" as s.PourConditions, batch: "021" },
    { temp: 14, conditions: "cloudy" as s.PourConditions, batch: "022" },
  ];
  const pourRows = completedJobIdx.map((j, k) => {
    const enqIdx = 8 + j;
    const d = enquiryDefs[enqIdx];
    const plan = jobPlans[j];
    const actualArea = d.areaM2 + (k === 1 ? -3 : k === 2 ? 4 : 2);
    const actualDepth = d.depthMm + (k === 2 ? 2 : 0);
    const code = d.screedType === SCREED.tla ? "ETL" : d.screedType === SCREED.nh ? "CNH" : "CFT";
    const signer =
      k === 0 ? "S. Kearns (Redrow site manager)" : k === 1 ? "G. Pugh (Anwyl site agent)" : "G. Pugh (Anwyl site agent)";
    return {
      jobId: jobs[j].id,
      actualAreaM2: dec(actualArea),
      actualDepthMm: actualDepth,
      actualVolumeM3: dec((actualArea * actualDepth) / 1000),
      screedType: d.screedType,
      batchRef: `${code}-${plan.scheduledDate.replace(/-/g, "")}-${pourMeta[k].batch}`,
      ambientTempC: pourMeta[k].temp,
      conditions: pourMeta[k].conditions,
      preCheckUfhPressure: true,
      preCheckEdgeInsulation: true,
      preCheckDpm: true,
      preCheckAccess: true,
      preCheckWaterPower: true,
      overrideReason: null,
      photos: [
        photo(`cws-pour-${j}-a`),
        photo(`cws-pour-${j}-b`),
        photo(`cws-pour-${j}-c`),
        ...(k === 1 ? [photo(`cws-pour-${j}-d`)] : []),
      ],
      customerSignatureName: signer,
      customerSignatureDataUrl: signatureDataUrl(signer),
      signedAt: at(plan.scheduledDate, 15, 20),
      notes:
        k === 0
          ? "Pour completed to programme. Levels checked with laser, all within tolerance."
          : k === 1
            ? "Good conditions. Site manager happy with finish. UFH to remain off for 7 days."
            : "Two-zone pour, no issues. Edge insulation re-checked before pump start.",
      completedAt: at(plan.scheduledDate, 15, 30),
    };
  });
  await db.insert(s.pourRecords).values(pourRows);
  console.log(`  ${pourRows.length} pour records`);

  /* invoices — completed jobs, mix of statuses */
  const invoiceRows = completedJobIdx.map((j, k) => {
    const qi = acceptedQuoteIdxByEnquiry.get(8 + j)!;
    const q = quotePayloads[qi];
    const plan = jobPlans[j];
    const created = at(plan.scheduledDate, 12, 0);
    const status: s.InvoiceStatus = k === 0 ? "overdue" : k === 1 ? "paid" : "sent";
    return {
      jobId: jobs[j].id,
      invoiceNumber: `CWS-INV-2026-${pad4(k + 1)}`,
      subtotal: dec(q.subtotal),
      vat: dec(q.vat),
      total: dec(q.total),
      status,
      dueDate: dateStr(addDays(created, 14)),
      paidAt: status === "paid" ? at("2026-05-14", 9, 45) : null,
      createdAt: created,
    };
  });
  const invoices = await db
    .insert(s.invoices)
    .values(invoiceRows)
    .returning({ id: s.invoices.id });
  console.log(`  ${invoices.length} invoices`);

  /* invoice lines — snapshot of the source quote's line items */
  const invoiceLineRows = completedJobIdx.flatMap((j, k) => {
    const qi = acceptedQuoteIdxByEnquiry.get(8 + j)!;
    return quotePayloads[qi].lines.map((l, li) => ({
      invoiceId: invoices[k].id,
      description: l.description,
      qty: dec(l.qty),
      unit: l.unit,
      unitPrice: dec(l.unitPrice),
      lineTotal: dec(l.qty * l.unitPrice),
      sortOrder: li,
    }));
  });
  await db.insert(s.invoiceLines).values(invoiceLineRows);
  console.log(`  ${invoiceLineRows.length} invoice lines`);

  console.log("✓ Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
