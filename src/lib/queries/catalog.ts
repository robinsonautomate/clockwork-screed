import { db } from "@/lib/db";

export async function getScreedTypes() {
  return db.query.screedTypes.findMany({
    orderBy: (s, { asc }) => [asc(s.name)],
  });
}

export async function getActiveScreedTypes() {
  const all = await getScreedTypes();
  return all.filter((s) => s.active);
}

export async function getCrews() {
  return db.query.crews.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function getTrucks() {
  return db.query.trucks.findMany({
    orderBy: (t, { asc }) => [asc(t.name)],
  });
}
