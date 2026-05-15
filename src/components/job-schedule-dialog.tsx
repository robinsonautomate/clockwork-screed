"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateJobSchedule } from "@/lib/actions/jobs";

type Option = { id: string; name: string };

export function JobScheduleDialog({
  jobId,
  scheduledDate,
  crewId,
  truckId,
  screedType,
  areaM2,
  depthMm,
  crews,
  trucks,
}: {
  jobId: string;
  scheduledDate: string;
  crewId: string | null;
  truckId: string | null;
  screedType: string;
  areaM2: string;
  depthMm: number;
  crews: Option[];
  trucks: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(scheduledDate);
  const [crew, setCrew] = useState(crewId ?? "none");
  const [truck, setTruck] = useState(truckId ?? "none");
  const [screed, setScreed] = useState(screedType);
  const [area, setArea] = useState(areaM2);
  const [depth, setDepth] = useState(String(depthMm));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await updateJobSchedule({
      jobId,
      scheduledDate: date,
      crewId: crew === "none" ? "" : crew,
      truckId: truck === "none" ? "" : truck,
      screedType: screed,
      areaM2: Number(area),
      depthMm: Number(depth),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Job updated");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil className="size-4" /> Edit job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit job</DialogTitle>
          <DialogDescription>
            Update the pour schedule, crew, truck and specification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Pour date" required>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Crew">
              <Select value={crew} onValueChange={setCrew}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {crews.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Truck">
              <Select value={truck} onValueChange={setTruck}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Screed type" required>
            <Input
              value={screed}
              onChange={(e) => setScreed(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area (m²)" required>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Field>
            <Field label="Depth (mm)" required>
              <Input
                type="number"
                inputMode="numeric"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="accent"
            onClick={save}
            disabled={
              saving || !date || !screed || Number(area) <= 0 || Number(depth) <= 0
            }
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
