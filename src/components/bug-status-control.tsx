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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateBugReport } from "@/lib/actions/bugs";
import type { BugStatus } from "@/lib/db/schema";

const STATUSES: { value: BugStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "wont_fix", label: "Won’t fix" },
];

export function BugStatusControl({
  id,
  status,
  resolutionNote,
}: {
  id: string;
  status: BugStatus;
  resolutionNote: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<BugStatus>(status);
  const [note, setNote] = useState(resolutionNote ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await updateBugReport(id, nextStatus, note);
    setBusy(false);
    if (res.ok) {
      toast.success("Bug log updated");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="size-3.5" /> Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update bug</DialogTitle>
          <DialogDescription>
            Set the status and add a resolution note for the log.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Status">
            <Select
              value={nextStatus}
              onValueChange={(v) => setNextStatus(v as BugStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Resolution note"
            hint="What was done, or why it won’t be fixed."
          >
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="accent" onClick={save} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
