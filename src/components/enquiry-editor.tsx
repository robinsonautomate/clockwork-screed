"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateEnquiry } from "@/lib/actions/enquiries";
import { formatArea, formatDate } from "@/lib/format";
import type { EnquiryUpdateInput } from "@/lib/validation";

const PROJECT_TYPES = [
  "new build",
  "extension",
  "refurb",
  "commercial",
] as const;
const STATUSES = ["new", "quoted", "won", "lost"] as const;

type EnquiryData = {
  id: string;
  projectType: string;
  screedType: string;
  targetDate: string | null;
  areaM2: string;
  depthMm: number;
  source: string | null;
  notes: string | null;
  status: string;
};

export function EnquiryEditor({
  enquiry,
  screedTypes,
}: {
  enquiry: EnquiryData;
  screedTypes: string[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [projectType, setProjectType] = useState(enquiry.projectType);
  const [screedType, setScreedType] = useState(enquiry.screedType);
  const [targetDate, setTargetDate] = useState(enquiry.targetDate ?? "");
  const [areaM2, setAreaM2] = useState(enquiry.areaM2);
  const [depthMm, setDepthMm] = useState(String(enquiry.depthMm));
  const [source, setSource] = useState(enquiry.source ?? "");
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [status, setStatus] = useState(enquiry.status);

  function cancel() {
    setProjectType(enquiry.projectType);
    setScreedType(enquiry.screedType);
    setTargetDate(enquiry.targetDate ?? "");
    setAreaM2(enquiry.areaM2);
    setDepthMm(String(enquiry.depthMm));
    setSource(enquiry.source ?? "");
    setNotes(enquiry.notes ?? "");
    setStatus(enquiry.status);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    const res = await updateEnquiry({
      id: enquiry.id,
      projectType: projectType as EnquiryUpdateInput["projectType"],
      screedType,
      targetDate,
      areaM2: Number(areaM2),
      depthMm: Number(depthMm),
      source,
      notes,
      status: status as EnquiryUpdateInput["status"],
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Enquiry updated");
      setEditing(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  const screedOptions = screedTypes.includes(screedType)
    ? screedTypes
    : [screedType, ...screedTypes];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">Enquiry</h2>
        {editing ? (
          <button
            type="button"
            onClick={cancel}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <X className="size-3.5" /> Cancel
          </button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project type">
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Screed type">
            <Select value={screedType} onValueChange={setScreedType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {screedOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area (m²)">
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={areaM2}
                onChange={(e) => setAreaM2(e.target.value)}
              />
            </Field>
            <Field label="Depth (mm)">
              <Input
                type="number"
                inputMode="numeric"
                value={depthMm}
                onChange={(e) => setDepthMm(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target date">
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </Field>
            <Field label="Source">
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          <Button
            variant="accent"
            onClick={save}
            disabled={saving || Number(areaM2) <= 0 || Number(depthMm) <= 0}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      ) : (
        <dl className="divide-y divide-slate-100 text-sm">
          <Row label="Project type">
            <span className="capitalize">{enquiry.projectType}</span>
          </Row>
          <Row label="Screed type">{enquiry.screedType}</Row>
          <Row label="Area">{formatArea(enquiry.areaM2)}</Row>
          <Row label="Depth">{enquiry.depthMm} mm</Row>
          <Row label="Target date">{formatDate(enquiry.targetDate)}</Row>
          <Row label="Source">{enquiry.source ?? "—"}</Row>
          {enquiry.notes && <Row label="Notes">{enquiry.notes}</Row>}
        </dl>
      )}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{children}</dd>
    </div>
  );
}
