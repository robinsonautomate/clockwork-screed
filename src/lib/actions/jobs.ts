"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import {
  jobScheduleSchema,
  type ActionResult,
  type JobScheduleInput,
} from "@/lib/validation";

export async function updateJobSchedule(
  input: JobScheduleInput,
): Promise<ActionResult> {
  const parsed = jobScheduleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the schedule details",
    };
  }
  const v = parsed.data;

  await db
    .update(jobs)
    .set({
      scheduledDate: v.scheduledDate,
      crewId: v.crewId || null,
      truckId: v.truckId || null,
    })
    .where(eq(jobs.id, v.jobId));

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${v.jobId}`);
  revalidatePath("/schedule");
  revalidatePath("/");
  return { ok: true };
}

export async function setJobStatus(
  jobId: string,
  status: "scheduled" | "in_progress" | "cancelled",
): Promise<ActionResult> {
  await db.update(jobs).set({ status }).where(eq(jobs.id, jobId));
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/schedule");
  return { ok: true };
}
