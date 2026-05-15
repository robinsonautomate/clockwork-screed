import { addDays, addWeeks, endOfWeek, startOfWeek } from "date-fns";
import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";

export async function getScheduleWeek(weekOffset = 0) {
  const base = addWeeks(new Date(), weekOffset);
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(base, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const startStr = weekStart.toISOString().slice(0, 10);
  const endStr = weekEnd.toISOString().slice(0, 10);

  const [weekJobs, crews] = await Promise.all([
    db.query.jobs.findMany({
      where: and(
        gte(jobs.scheduledDate, startStr),
        lte(jobs.scheduledDate, endStr),
      ),
      with: {
        site: { columns: { town: true, addressLine1: true } },
        contact: { columns: { name: true, company: true } },
      },
    }),
    db.query.crews.findMany({ orderBy: (c, { asc }) => [asc(c.name)] }),
  ]);

  return { weekStart, weekEnd, days, crews, jobs: weekJobs, weekOffset };
}

export type ScheduleWeek = Awaited<ReturnType<typeof getScheduleWeek>>;
