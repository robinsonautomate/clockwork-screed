"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bug, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createBugReport } from "@/lib/actions/bugs";

type Severity = "low" | "medium" | "high";

export function BugReportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [detail, setDetail] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [busy, setBusy] = useState(false);

  // The pour flow has its own sticky bottom bar — keep it uncluttered.
  if (pathname?.endsWith("/pour")) return null;

  async function submit() {
    setBusy(true);
    const res = await createBugReport({
      summary,
      detail,
      pageUrl: pathname ?? "",
      severity,
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Bug reported — thanks, we’re on it");
      setOpen(false);
      setSummary("");
      setDetail("");
      setSeverity("medium");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition-colors hover:bg-amber-400"
        >
          <Bug className="size-4" />
          <span className="hidden sm:inline">Report a bug</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="size-4 text-amber-600" /> Report a bug
          </DialogTitle>
          <DialogDescription>
            Spotted something wrong? Tell us and it goes straight into the bug
            log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="What went wrong?" required>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Quote total doesn’t update after editing a line"
            />
          </Field>
          <Field
            label="More detail"
            hint="Steps to reproduce, what you expected, anything useful."
          >
            <Textarea
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </Field>
          <Field label="Severity">
            <Select
              value={severity}
              onValueChange={(v) => setSeverity(v as Severity)}
            >
              <SelectTrigger className="w-full capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low — minor / cosmetic</SelectItem>
                <SelectItem value="medium">Medium — annoying</SelectItem>
                <SelectItem value="high">High — blocks my work</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">
            Reporting from <span className="font-mono">{pathname}</span>
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="accent"
            onClick={submit}
            disabled={busy || summary.trim().length < 4}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Submit bug report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
