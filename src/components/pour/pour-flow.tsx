"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  CloudRain,
  Cloud,
  Download,
  Flame,
  Loader2,
  Snowflake,
  Sun,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SignaturePad } from "@/components/pour/signature-pad";
import { savePourRecord } from "@/lib/actions/pour";
import { formatArea } from "@/lib/format";
import { cn } from "@/lib/utils";

type PourJob = {
  id: string;
  jobNumber: string;
  areaM2: string;
  depthMm: number;
  screedType: string;
  siteTown: string;
  siteAddress: string;
  contactName: string;
};

const STEPS = [
  "Pre-pour checks",
  "Pour data",
  "Site photos",
  "Customer sign-off",
  "Review & complete",
];

const CHECKS = [
  ["ufh", "UFH pressure tested", "Underfloor heating charged & holding pressure"],
  ["edge", "Edge insulation", "Perimeter edge strip fitted to all walls"],
  ["dpm", "DPM / membrane", "Damp-proof membrane lapped & sealed"],
  ["access", "Site access", "Clear route for pump line to the pour area"],
  ["waterPower", "Water & power", "Mains water and power available on site"],
] as const;

type CheckKey = (typeof CHECKS)[number][0];

const CONDITIONS = [
  { value: "sunny", label: "Sunny", icon: Sun },
  { value: "cloudy", label: "Cloudy", icon: Cloud },
  { value: "rain", label: "Rain", icon: CloudRain },
  { value: "cold", label: "Cold", icon: Snowflake },
  { value: "hot", label: "Hot", icon: Flame },
] as const;

export function PourFlow({ job }: { job: PourJob }) {
  const [step, setStep] = useState(0);

  // Step 1 — checks
  const [checks, setChecks] = useState<Record<CheckKey, boolean>>({
    ufh: false,
    edge: false,
    dpm: false,
    access: false,
    waterPower: false,
  });
  const [overrideReason, setOverrideReason] = useState("");

  // Step 2 — pour data
  const [actualArea, setActualArea] = useState(job.areaM2);
  const [actualDepth, setActualDepth] = useState(String(job.depthMm));
  const [screedType, setScreedType] = useState(job.screedType);
  const [batchRef, setBatchRef] = useState("");
  const [ambientTemp, setAmbientTemp] = useState("15");
  const [conditions, setConditions] = useState("cloudy");

  // Step 3 — photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 4 — sign-off
  const [signerName, setSignerName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);

  // Step 5
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const allChecks = Object.values(checks).every(Boolean);
  const checksOk = allChecks || overrideReason.trim().length >= 4;
  const dataOk =
    Number(actualArea) > 0 &&
    Number(actualDepth) > 0 &&
    ambientTemp.trim() !== "" &&
    !Number.isNaN(Number(ambientTemp)) &&
    conditions !== "";
  const signOk = signerName.trim().length >= 2 && !!signature;

  const canAdvance = [checksOk, dataOk, true, signOk, true][step];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = 8 - photos.length;
    const picked = Array.from(files).slice(0, room);
    setUploading(true);
    try {
      for (const file of picked) {
        const blob = await upload(
          `pour-photos/${job.id}/${crypto.randomUUID()}-${file.name}`,
          file,
          { access: "public", handleUploadUrl: "/api/upload" },
        );
        setPhotos((p) => [...p, blob.url]);
      }
      toast.success(`${picked.length} photo${picked.length > 1 ? "s" : ""} uploaded`);
    } catch {
      toast.error("Photo upload failed — check your connection and retry");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function complete() {
    setSaving(true);
    const res = await savePourRecord({
      jobId: job.id,
      preCheckUfhPressure: checks.ufh,
      preCheckEdgeInsulation: checks.edge,
      preCheckDpm: checks.dpm,
      preCheckAccess: checks.access,
      preCheckWaterPower: checks.waterPower,
      overrideReason: allChecks ? "" : overrideReason.trim(),
      actualAreaM2: Number(actualArea),
      actualDepthMm: Number(actualDepth),
      screedType,
      batchRef: batchRef.trim(),
      ambientTempC: Number(ambientTemp),
      conditions: conditions as
        | "sunny"
        | "cloudy"
        | "rain"
        | "cold"
        | "hot",
      photos,
      customerSignatureName: signerName.trim(),
      customerSignatureDataUrl: signature ?? "",
      notes: "",
    });
    setSaving(false);
    if (res.ok) {
      setCompleted(true);
      toast.success("Pour record saved");
    } else {
      toast.error(res.error);
    }
  }

  /* ── Completed confirmation ──────────────────────────────────────────── */
  if (completed) {
    return (
      <div className="mx-auto max-w-md space-y-5 pb-10">
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="rounded-full bg-emerald-100 p-3">
            <CheckCircle2 className="size-9 text-emerald-600" />
          </div>
          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            Pour record saved
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {job.jobNumber} marked complete. The aftercare certificate is ready
            to hand to the customer.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            Aftercare certificate preview
          </div>
          <iframe
            title="Aftercare certificate"
            src={`/api/jobs/${job.id}/certificate`}
            className="h-[420px] w-full"
          />
        </div>

        <div className="grid gap-2">
          <Button asChild variant="accent" size="lg" className="h-12 text-base">
            <a
              href={`/api/jobs/${job.id}/certificate`}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="size-5" /> Download Aftercare Certificate
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12">
            <Link href={`/jobs/${job.id}`}>Back to job</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ── Stepper ─────────────────────────────────────────────────────────── */
  return (
    <div className="mx-auto flex max-w-md flex-col pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-slate-500">{job.jobNumber}</p>
          <h1 className="text-lg font-semibold text-slate-900">
            {job.siteTown}
          </h1>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Exit pour record"
        >
          <X className="size-5" />
        </Link>
      </div>

      {/* Progress */}
      <div className="mt-3 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step ? "bg-amber-500" : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      {/* Step body */}
      <div className="mt-4">
        {step === 0 && (
          <StepChecks
            checks={checks}
            setChecks={setChecks}
            allChecks={allChecks}
            overrideReason={overrideReason}
            setOverrideReason={setOverrideReason}
          />
        )}
        {step === 1 && (
          <StepData
            actualArea={actualArea}
            setActualArea={setActualArea}
            actualDepth={actualDepth}
            setActualDepth={setActualDepth}
            screedType={screedType}
            setScreedType={setScreedType}
            batchRef={batchRef}
            setBatchRef={setBatchRef}
            ambientTemp={ambientTemp}
            setAmbientTemp={setAmbientTemp}
            conditions={conditions}
            setConditions={setConditions}
          />
        )}
        {step === 2 && (
          <StepPhotos
            photos={photos}
            setPhotos={setPhotos}
            uploading={uploading}
            fileRef={fileRef}
            onFiles={handleFiles}
          />
        )}
        {step === 3 && (
          <StepSignoff
            signerName={signerName}
            setSignerName={setSignerName}
            setSignature={setSignature}
            defaultName={job.contactName}
          />
        )}
        {step === 4 && (
          <StepReview
            job={job}
            actualArea={actualArea}
            actualDepth={actualDepth}
            screedType={screedType}
            batchRef={batchRef}
            ambientTemp={ambientTemp}
            conditions={conditions}
            photoCount={photos.length}
            signerName={signerName}
            allChecks={allChecks}
          />
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              variant="accent"
              size="lg"
              className="h-12 flex-1 text-base"
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              className="h-12 flex-1 text-base"
              disabled={saving}
              onClick={complete}
            >
              {saving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Check className="size-5" />
              )}
              Complete pour record
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1 — checks ───────────────────────────────────────────────────── */
function StepChecks({
  checks,
  setChecks,
  allChecks,
  overrideReason,
  setOverrideReason,
}: {
  checks: Record<CheckKey, boolean>;
  setChecks: (fn: (c: Record<CheckKey, boolean>) => Record<CheckKey, boolean>) => void;
  allChecks: boolean;
  overrideReason: string;
  setOverrideReason: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Confirm every pre-pour check before laying screed. All must pass — or
        record a supervisor override.
      </p>
      {CHECKS.map(([key, label, detail]) => (
        <label
          key={key}
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 p-3.5 transition-colors",
            checks[key]
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-white",
          )}
        >
          <Switch
            checked={checks[key]}
            onCheckedChange={(v) =>
              setChecks((c) => ({ ...c, [key]: v }))
            }
            className="data-[state=checked]:bg-emerald-600"
          />
          <span className="flex-1">
            <span className="block text-sm font-semibold text-slate-800">
              {label}
            </span>
            <span className="block text-xs text-slate-500">{detail}</span>
          </span>
          {checks[key] && (
            <CheckCircle2 className="size-5 text-emerald-600" />
          )}
        </label>
      ))}

      {!allChecks && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3.5">
          <p className="text-sm font-semibold text-amber-800">
            Supervisor override
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            Not all checks pass. Record the reason for proceeding — this is
            logged on the pour record.
          </p>
          <Textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            rows={2}
            placeholder="Reason for override…"
            className="mt-2 bg-white"
          />
        </div>
      )}
    </div>
  );
}

/* ── Step 2 — pour data ────────────────────────────────────────────────── */
function StepData(props: {
  actualArea: string;
  setActualArea: (v: string) => void;
  actualDepth: string;
  setActualDepth: (v: string) => void;
  screedType: string;
  setScreedType: (v: string) => void;
  batchRef: string;
  setBatchRef: (v: string) => void;
  ambientTemp: string;
  setAmbientTemp: (v: string) => void;
  conditions: string;
  setConditions: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <BigField label="Area poured (m²)">
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={props.actualArea}
            onChange={(e) => props.setActualArea(e.target.value)}
            className="h-12 text-base font-mono"
          />
        </BigField>
        <BigField label="Depth (mm)">
          <Input
            type="number"
            inputMode="numeric"
            value={props.actualDepth}
            onChange={(e) => props.setActualDepth(e.target.value)}
            className="h-12 text-base font-mono"
          />
        </BigField>
      </div>
      <BigField label="Screed type">
        <Input
          value={props.screedType}
          onChange={(e) => props.setScreedType(e.target.value)}
          className="h-12 text-base"
        />
      </BigField>
      <div className="grid grid-cols-2 gap-3">
        <BigField label="Batch reference">
          <Input
            value={props.batchRef}
            onChange={(e) => props.setBatchRef(e.target.value)}
            placeholder="e.g. CFT-20260515-01"
            className="h-12 text-base font-mono"
          />
        </BigField>
        <BigField label="Ambient temp (°C)">
          <Input
            type="number"
            inputMode="numeric"
            value={props.ambientTemp}
            onChange={(e) => props.setAmbientTemp(e.target.value)}
            className="h-12 text-base font-mono"
          />
        </BigField>
      </div>
      <BigField label="Conditions on site">
        <div className="grid grid-cols-5 gap-1.5">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => props.setConditions(c.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xs font-medium transition-colors",
                props.conditions === c.value
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-500",
              )}
            >
              <c.icon className="size-5" />
              {c.label}
            </button>
          ))}
        </div>
      </BigField>
    </div>
  );
}

/* ── Step 3 — photos ───────────────────────────────────────────────────── */
function StepPhotos({
  photos,
  setPhotos,
  uploading,
  fileRef,
  onFiles,
}: {
  photos: string[];
  setPhotos: (fn: (p: string[]) => string[]) => void;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Capture the finished pour, edges and any issues — up to 8 photos.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url) => (
          <div key={url} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Pour photo"
              className="aspect-square w-full rounded-xl border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
              className="absolute -top-1.5 -right-1.5 rounded-full bg-slate-900 p-1 text-white shadow-sm"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {photos.length < 8 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-amber-400 hover:text-amber-600 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <Camera className="size-6" />
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading" : "Add photo"}
            </span>
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400">
        {photos.length} of 8 added · photos are optional but recommended.
      </p>
    </div>
  );
}

/* ── Step 4 — sign-off ─────────────────────────────────────────────────── */
function StepSignoff({
  signerName,
  setSignerName,
  setSignature,
  defaultName,
}: {
  signerName: string;
  setSignerName: (v: string) => void;
  setSignature: (v: string | null) => void;
  defaultName: string;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Hand the device to the customer or site representative to confirm the
        pour is complete and accepted.
      </p>
      <BigField label="Name of person signing">
        <Input
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder={defaultName || "Full name"}
          className="h-12 text-base"
        />
      </BigField>
      <BigField label="Signature">
        <SignaturePad onChange={setSignature} />
      </BigField>
    </div>
  );
}

/* ── Step 5 — review ───────────────────────────────────────────────────── */
function StepReview({
  job,
  actualArea,
  actualDepth,
  screedType,
  batchRef,
  ambientTemp,
  conditions,
  photoCount,
  signerName,
  allChecks,
}: {
  job: PourJob;
  actualArea: string;
  actualDepth: string;
  screedType: string;
  batchRef: string;
  ambientTemp: string;
  conditions: string;
  photoCount: number;
  signerName: string;
  allChecks: boolean;
}) {
  const rows: [string, string][] = [
    ["Site", `${job.siteAddress}, ${job.siteTown}`],
    ["Pre-pour checks", allChecks ? "All passed" : "Supervisor override"],
    ["Area poured", formatArea(actualArea)],
    ["Depth", `${actualDepth} mm`],
    ["Screed type", screedType],
    ["Batch reference", batchRef || "—"],
    ["Ambient temp", `${ambientTemp}°C`],
    ["Conditions", conditions],
    ["Photos", `${photoCount} attached`],
    ["Signed by", signerName || "—"],
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Check the details below, then complete the pour record. This marks the
        job done and generates the aftercare certificate.
      </p>
      <dl className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows.map(([label, value], i) => (
          <div
            key={label}
            className={cn(
              "flex justify-between gap-4 px-4 py-2.5 text-sm",
              i !== 0 && "border-t border-slate-100",
            )}
          >
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-800 capitalize">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function BigField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
