"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { crews, screedTypes, trucks } from "@/lib/db/schema";
import { normalizeName } from "@/lib/format";
import {
  crewSchema,
  screedTypeSchema,
  truckSchema,
  type ActionResult,
  type CrewInput,
  type ScreedTypeInput,
  type TruckInput,
} from "@/lib/validation";

function revalidate() {
  revalidatePath("/settings");
  revalidatePath("/");
}

const firstIssue = (msg?: string) => msg ?? "Check the details and try again";

/* ── Crews ────────────────────────────────────────────────────────────── */

export async function createCrew(input: CrewInput): Promise<ActionResult> {
  const p = crewSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db.insert(crews).values({
    name: normalizeName(p.data.name),
    leadName: normalizeName(p.data.leadName),
    active: p.data.active,
  });
  revalidate();
  return { ok: true };
}

export async function updateCrew(
  id: string,
  input: CrewInput,
): Promise<ActionResult> {
  const p = crewSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db
    .update(crews)
    .set({
      name: normalizeName(p.data.name),
      leadName: normalizeName(p.data.leadName),
      active: p.data.active,
    })
    .where(eq(crews.id, id));
  revalidate();
  return { ok: true };
}

export async function deleteCrew(id: string): Promise<ActionResult> {
  await db.delete(crews).where(eq(crews.id, id));
  revalidate();
  return { ok: true };
}

/* ── Trucks ───────────────────────────────────────────────────────────── */

export async function createTruck(input: TruckInput): Promise<ActionResult> {
  const p = truckSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db.insert(trucks).values({
    name: p.data.name,
    registration: p.data.registration.toUpperCase(),
    capacityM3: String(p.data.capacityM3),
    active: p.data.active,
  });
  revalidate();
  return { ok: true };
}

export async function updateTruck(
  id: string,
  input: TruckInput,
): Promise<ActionResult> {
  const p = truckSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db
    .update(trucks)
    .set({
      name: p.data.name,
      registration: p.data.registration.toUpperCase(),
      capacityM3: String(p.data.capacityM3),
      active: p.data.active,
    })
    .where(eq(trucks.id, id));
  revalidate();
  return { ok: true };
}

export async function deleteTruck(id: string): Promise<ActionResult> {
  await db.delete(trucks).where(eq(trucks.id, id));
  revalidate();
  return { ok: true };
}

/* ── Screed types ─────────────────────────────────────────────────────── */

export async function createScreedType(
  input: ScreedTypeInput,
): Promise<ActionResult> {
  const p = screedTypeSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db.insert(screedTypes).values({
    name: p.data.name,
    defaultPricePerM2: String(p.data.defaultPricePerM2),
    defaultDepthMm: p.data.defaultDepthMm,
    active: p.data.active,
  });
  revalidate();
  return { ok: true };
}

export async function updateScreedType(
  id: string,
  input: ScreedTypeInput,
): Promise<ActionResult> {
  const p = screedTypeSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstIssue(p.error.issues[0]?.message) };
  await db
    .update(screedTypes)
    .set({
      name: p.data.name,
      defaultPricePerM2: String(p.data.defaultPricePerM2),
      defaultDepthMm: p.data.defaultDepthMm,
      active: p.data.active,
    })
    .where(eq(screedTypes.id, id));
  revalidate();
  return { ok: true };
}

export async function deleteScreedType(id: string): Promise<ActionResult> {
  await db.delete(screedTypes).where(eq(screedTypes.id, id));
  revalidate();
  return { ok: true };
}
