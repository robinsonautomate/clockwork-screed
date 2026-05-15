"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCog, Loader2 } from "lucide-react";
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
  crews,
  trucks,
}: {
  jobId: string;
  scheduledDate: string;
  crewId: string | null;
  truckId: string | null;
  crews: Option[];
  trucks: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(scheduledDate);
  const [crew, setCrew] = useState(crewId ?? "none");
  const [truck, setTruck] = useState(truckId ?? "none");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await updateJobSchedule({
      jobId,
      scheduledDate: date,
      crewId: crew === "none" ? "" : crew,
      truckId: truck === "none" ? "" : truck,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Schedule updated");
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
          <CalendarCog className="size-4" /> Edit schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit schedule</DialogTitle>
          <DialogDescription>
            Set the pour date and assign a crew and truck.
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

        <DialogFooter>
          <Button
            variant="accent"
            onClick={save}
            disabled={saving || !date}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
