"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  createCrew,
  createScreedType,
  createTruck,
  deleteAllData,
  deleteCrew,
  deleteScreedType,
  deleteTruck,
  updateCrew,
  updateScreedType,
  updateTruck,
} from "@/lib/actions/settings";
import { gbp } from "@/lib/format";
import { cn } from "@/lib/utils";

type Crew = { id: string; name: string; leadName: string; active: boolean };
type Truck = {
  id: string;
  name: string;
  registration: string;
  capacityM3: string;
  active: boolean;
};
type ScreedType = {
  id: string;
  name: string;
  defaultPricePerM2: string;
  defaultDepthMm: number;
  active: boolean;
};

export function SettingsPanels({
  crews,
  trucks,
  screedTypes,
}: {
  crews: Crew[];
  trucks: Truck[];
  screedTypes: ScreedType[];
}) {
  return (
    <div className="space-y-5">
      <CrewsPanel crews={crews} />
      <TrucksPanel trucks={trucks} />
      <ScreedTypesPanel screedTypes={screedTypes} />
      <DangerZone />
    </div>
  );
}

/* ── Danger zone ──────────────────────────────────────────────────────── */

function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  async function wipe() {
    setBusy(true);
    const res = await deleteAllData();
    setBusy(false);
    if (res.ok) {
      toast.success("All operational data deleted");
      setOpen(false);
      setConfirmText("");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-rose-200 bg-white">
      <div className="border-b border-rose-200 bg-rose-50 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-rose-800">
          <AlertTriangle className="size-4" />
          Danger zone
        </h2>
        <p className="text-xs text-rose-600">
          Irreversible — clears the platform to start fresh.
        </p>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Delete all contacts, enquiries, quotes, jobs, pour records and
          invoices. Crews, trucks, the screed catalog and the bug log are kept.
        </p>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setConfirmText("");
          }}
        >
          <DialogTrigger asChild>
            <Button variant="destructive" className="shrink-0">
              <Trash2 className="size-4" /> Delete all data
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="size-4" /> Delete all data?
              </DialogTitle>
              <DialogDescription>
                This permanently removes every contact, enquiry, quote, job,
                pour record and invoice. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Kept: crews, trucks, screed-type catalog and the bug log. You
                can repopulate demo data afterwards with{" "}
                <span className="font-mono">pnpm seed</span>.
              </p>
              <Field label="Type DELETE to confirm">
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={wipe}
                disabled={busy || confirmText !== "DELETE"}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Permanently delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

/* ── Shared shell ─────────────────────────────────────────────────────── */

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActivePill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-500",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActiveToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-sm text-slate-700">Active</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/* ── Crews ────────────────────────────────────────────────────────────── */

function CrewsPanel({ crews }: { crews: Crew[] }) {
  return (
    <Panel
      title="Crews"
      description="Pour teams available for scheduling."
      action={<CrewDialog />}
    >
      <ul className="divide-y divide-slate-100">
        {crews.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-500">Lead: {c.leadName}</p>
            </div>
            <div className="flex items-center gap-2">
              <ActivePill active={c.active} />
              <CrewDialog crew={c} />
            </div>
          </li>
        ))}
        {crews.length === 0 && <Empty label="No crews yet" />}
      </ul>
    </Panel>
  );
}

function CrewDialog({ crew }: { crew?: Crew }) {
  const router = useRouter();
  const editing = !!crew;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(crew?.name ?? "");
  const [leadName, setLeadName] = useState(crew?.leadName ?? "");
  const [active, setActive] = useState(crew?.active ?? true);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const input = { name, leadName, active };
    const res = editing
      ? await updateCrew(crew!.id, input)
      : await createCrew(input);
    setBusy(false);
    if (res.ok) {
      toast.success(editing ? "Crew updated" : "Crew added");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function remove() {
    setBusy(true);
    const res = await deleteCrew(crew!.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Crew removed");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{editTrigger(editing)}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit crew" : "Add crew"}</DialogTitle>
          <DialogDescription>
            Crews appear on the schedule and job assignments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Crew name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Crew A — Daniel"
            />
          </Field>
          <Field label="Crew lead" required>
            <Input
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
          </Field>
          <ActiveToggle checked={active} onChange={setActive} />
        </div>
        <DialogFooter className="sm:justify-between">
          {editing ? (
            <Button variant="destructive" onClick={remove} disabled={busy}>
              <Trash2 className="size-4" /> Remove
            </Button>
          ) : (
            <span />
          )}
          <Button variant="accent" onClick={save} disabled={busy || !name}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save" : "Add crew"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Trucks ───────────────────────────────────────────────────────────── */

function TrucksPanel({ trucks }: { trucks: Truck[] }) {
  return (
    <Panel
      title="Trucks"
      description="Mixer / pump vehicles in the fleet."
      action={<TruckDialog />}
    >
      <ul className="divide-y divide-slate-100">
        {trucks.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {t.name}{" "}
                <span className="font-mono text-xs text-slate-500">
                  {t.registration}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                Capacity {t.capacityM3} m³
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActivePill active={t.active} />
              <TruckDialog truck={t} />
            </div>
          </li>
        ))}
        {trucks.length === 0 && <Empty label="No trucks yet" />}
      </ul>
    </Panel>
  );
}

function TruckDialog({ truck }: { truck?: Truck }) {
  const router = useRouter();
  const editing = !!truck;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(truck?.name ?? "");
  const [registration, setRegistration] = useState(truck?.registration ?? "");
  const [capacityM3, setCapacityM3] = useState(truck?.capacityM3 ?? "8");
  const [active, setActive] = useState(truck?.active ?? true);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const input = { name, registration, capacityM3: Number(capacityM3), active };
    const res = editing
      ? await updateTruck(truck!.id, input)
      : await createTruck(input);
    setBusy(false);
    if (res.ok) {
      toast.success(editing ? "Truck updated" : "Truck added");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }
  async function remove() {
    setBusy(true);
    const res = await deleteTruck(truck!.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Truck removed");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{editTrigger(editing)}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit truck" : "Add truck"}</DialogTitle>
          <DialogDescription>
            Vehicles available to assign to pours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Transmix 03"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Registration" required>
              <Input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                className="font-mono uppercase"
              />
            </Field>
            <Field label="Capacity (m³)" required>
              <Input
                type="number"
                step="0.5"
                value={capacityM3}
                onChange={(e) => setCapacityM3(e.target.value)}
              />
            </Field>
          </div>
          <ActiveToggle checked={active} onChange={setActive} />
        </div>
        <DialogFooter className="sm:justify-between">
          {editing ? (
            <Button variant="destructive" onClick={remove} disabled={busy}>
              <Trash2 className="size-4" /> Remove
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="accent"
            onClick={save}
            disabled={busy || !name || !registration}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save" : "Add truck"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Screed types ─────────────────────────────────────────────────────── */

function ScreedTypesPanel({ screedTypes }: { screedTypes: ScreedType[] }) {
  return (
    <Panel
      title="Screed type catalog"
      description="Products with default pricing and depth."
      action={<ScreedTypeDialog />}
    >
      <ul className="divide-y divide-slate-100">
        {screedTypes.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-500">
                {gbp(s.defaultPricePerM2)}/m² · default {s.defaultDepthMm}mm
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ActivePill active={s.active} />
              <ScreedTypeDialog screedType={s} />
            </div>
          </li>
        ))}
        {screedTypes.length === 0 && <Empty label="No screed types yet" />}
      </ul>
    </Panel>
  );
}

function ScreedTypeDialog({ screedType }: { screedType?: ScreedType }) {
  const router = useRouter();
  const editing = !!screedType;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(screedType?.name ?? "");
  const [price, setPrice] = useState(screedType?.defaultPricePerM2 ?? "18");
  const [depth, setDepth] = useState(
    screedType ? String(screedType.defaultDepthMm) : "50",
  );
  const [active, setActive] = useState(screedType?.active ?? true);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const input = {
      name,
      defaultPricePerM2: Number(price),
      defaultDepthMm: Number(depth),
      active,
    };
    const res = editing
      ? await updateScreedType(screedType!.id, input)
      : await createScreedType(input);
    setBusy(false);
    if (res.ok) {
      toast.success(editing ? "Screed type updated" : "Screed type added");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }
  async function remove() {
    setBusy(true);
    const res = await deleteScreedType(screedType!.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Screed type removed");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{editTrigger(editing)}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit screed type" : "Add screed type"}
          </DialogTitle>
          <DialogDescription>
            Used to pre-fill quotes from enquiries.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cemfloor Therm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Default £/m²" required>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field label="Default depth (mm)" required>
              <Input
                type="number"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </Field>
          </div>
          <ActiveToggle checked={active} onChange={setActive} />
        </div>
        <DialogFooter className="sm:justify-between">
          {editing ? (
            <Button variant="destructive" onClick={remove} disabled={busy}>
              <Trash2 className="size-4" /> Remove
            </Button>
          ) : (
            <span />
          )}
          <Button variant="accent" onClick={save} disabled={busy || !name}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save" : "Add screed type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function editTrigger(editing: boolean) {
  return editing ? (
    <Button variant="ghost" size="icon-sm" aria-label="Edit">
      <Pencil className="size-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm">
      <Plus className="size-3.5" /> Add
    </Button>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <li className="px-4 py-6 text-center text-sm text-slate-400">{label}</li>
  );
}
