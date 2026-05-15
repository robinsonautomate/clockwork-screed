import { db } from "@/lib/db";

export async function listBugReports() {
  return db.query.bugReports.findMany({
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}
