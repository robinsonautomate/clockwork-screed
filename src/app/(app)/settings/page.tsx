import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SettingsPanels } from "@/components/settings-panels";
import { getCrews, getScreedTypes, getTrucks } from "@/lib/queries/catalog";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [crews, trucks, screedTypes] = await Promise.all([
    getCrews(),
    getTrucks(),
    getScreedTypes(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Settings"
        description="Crews, trucks and the screed type catalog used across the platform."
      />
      <SettingsPanels
        crews={crews}
        trucks={trucks}
        screedTypes={screedTypes}
      />
    </div>
  );
}
