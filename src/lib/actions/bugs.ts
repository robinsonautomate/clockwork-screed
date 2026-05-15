"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bugReports } from "@/lib/db/schema";
import type { BugStatus } from "@/lib/db/schema";
import {
  bugReportSchema,
  type ActionResult,
  type BugReportInput,
} from "@/lib/validation";

export async function createBugReport(
  input: BugReportInput,
): Promise<ActionResult> {
  const parsed = bugReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Add a short description",
    };
  }
  const v = parsed.data;

  await db.insert(bugReports).values({
    summary: v.summary,
    detail: v.detail || null,
    pageUrl: v.pageUrl || null,
    severity: v.severity,
  });

  revalidatePath("/bugs");
  return { ok: true };
}

export async function updateBugReport(
  id: string,
  status: BugStatus,
  resolutionNote: string,
): Promise<ActionResult> {
  const isClosed = status === "resolved" || status === "wont_fix";

  await db
    .update(bugReports)
    .set({
      status,
      resolutionNote: resolutionNote.trim() || null,
      resolvedAt: isClosed ? new Date() : null,
    })
    .where(eq(bugReports.id, id));

  revalidatePath("/bugs");
  return { ok: true };
}
