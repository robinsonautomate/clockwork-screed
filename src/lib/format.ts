import { format, parseISO } from "date-fns";

/* ── Money ────────────────────────────────────────────────────────────── */

const gbp2 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const gbp0 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function toNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/** £1,800.00 — or £1,800 when decimals: 0 */
export function gbp(
  v: string | number | null | undefined,
  opts?: { decimals?: 0 | 2 },
): string {
  const n = toNumber(v);
  return (opts?.decimals === 0 ? gbp0 : gbp2).format(n);
}

/* ── Numbers / units ──────────────────────────────────────────────────── */

const num = new Intl.NumberFormat("en-GB");
const num1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const num2 = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNumber(v: string | number | null | undefined): string {
  return num.format(toNumber(v));
}

/** 1,150 m² */
export function formatArea(v: string | number | null | undefined): string {
  return `${num1.format(toNumber(v))} m²`;
}

/** 35.10 m³ */
export function formatVolume(v: string | number | null | undefined): string {
  return `${num2.format(toNumber(v))} m³`;
}

/* ── Text casing ──────────────────────────────────────────────────────── */

/** "cloudy" → "Cloudy" */
export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Tidy up user-entered names/places. If the text was typed all-uppercase or
 * all-lowercase, convert it to Title Case; if the user typed deliberate mixed
 * case (e.g. "PH Homes", "O'Brien"), leave it untouched.
 */
export function normalizeName(input: string): string {
  const s = input.trim();
  if (!s) return s;
  const letters = s.replace(/[^A-Za-z]/g, "");
  if (!letters) return s;
  const allUpper = letters === letters.toUpperCase();
  const allLower = letters === letters.toLowerCase();
  if (!allUpper && !allLower) return s;
  return s.toLowerCase().replace(/(^|[\s'’\-/(])([a-z])/g, (_m, p, c) => p + c.toUpperCase());
}

/* ── Dates (UK format) ────────────────────────────────────────────────── */

type DateInput = Date | string | null | undefined;

export function toDate(d: DateInput): Date | null {
  if (!d) return null;
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d;
  const parsed = d.length === 10 ? parseISO(d) : new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** 15 May 2026 */
export function formatDate(d: DateInput, fallback = "—"): string {
  const date = toDate(d);
  return date ? format(date, "d MMM yyyy") : fallback;
}

/** 15 May 2026, 15:30 */
export function formatDateTime(d: DateInput, fallback = "—"): string {
  const date = toDate(d);
  return date ? format(date, "d MMM yyyy, HH:mm") : fallback;
}

/** Fri 15 May */
export function formatDayShort(d: DateInput, fallback = "—"): string {
  const date = toDate(d);
  return date ? format(date, "EEE d MMM") : fallback;
}

/** Mon */
export function formatWeekday(d: DateInput): string {
  const date = toDate(d);
  return date ? format(date, "EEE") : "";
}
