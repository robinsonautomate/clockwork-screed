"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { createEnquiry } from "@/lib/actions/enquiries";
import {
  enquirySchema,
  type EnquiryFormValues,
  type EnquiryInput,
} from "@/lib/validation";

type ContactOption = { id: string; name: string; company: string | null };

const ROLES = [
  "self-builder",
  "developer",
  "main contractor",
  "architect",
] as const;
const PROJECT_TYPES = [
  "new build",
  "extension",
  "refurb",
  "commercial",
] as const;

export function NewEnquiryDialog({
  contacts,
  screedTypes,
}: {
  contacts: ContactOption[];
  screedTypes: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [contactMode, setContactMode] = useState<"existing" | "new">(
    contacts.length > 0 ? "existing" : "new",
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues, unknown, EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      contactId: "",
      newContactName: "",
      newContactCompany: "",
      newContactRole: "self-builder",
      newContactEmail: "",
      newContactPhone: "",
      addressLine1: "",
      addressLine2: "",
      town: "",
      postcode: "",
      accessNotes: "",
      projectType: "extension",
      screedType: screedTypes[0] ?? "",
      targetDate: "",
      source: "",
      notes: "",
    },
  });

  async function onSubmit(values: EnquiryInput) {
    const payload: EnquiryInput =
      contactMode === "existing"
        ? { ...values, newContactName: "" }
        : { ...values, contactId: "" };

    if (contactMode === "existing" && !payload.contactId) {
      toast.error("Choose a contact");
      return;
    }
    if (contactMode === "new" && !payload.newContactName) {
      toast.error("Enter the new contact's name");
      return;
    }

    const res = await createEnquiry(payload);
    if (res.ok && res.data) {
      toast.success("Enquiry logged");
      setOpen(false);
      reset();
      router.push(`/enquiries/${res.data.id}`);
    } else if (!res.ok) {
      toast.error(res.error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="size-4" /> New enquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New enquiry</DialogTitle>
          <DialogDescription>
            Log a new lead — contact, site and project details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-5"
        >
          {/* Contact */}
          <section className="space-y-3">
            <SectionLabel>Contact</SectionLabel>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(["existing", "new"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setContactMode(m)}
                  disabled={m === "existing" && contacts.length === 0}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40",
                    contactMode === m
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {m} contact
                </button>
              ))}
            </div>

            {contactMode === "existing" ? (
              <Field label="Contact" required>
                <Controller
                  control={control}
                  name="contactId"
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a contact…" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.company ? ` · ${c.company}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Name"
                    required
                    error={errors.newContactName?.message}
                  >
                    <Input {...register("newContactName")} />
                  </Field>
                  <Field label="Company">
                    <Input {...register("newContactCompany")} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role">
                    <Controller
                      control={control}
                      name="newContactRole"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem
                                key={r}
                                value={r}
                                className="capitalize"
                              >
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input {...register("newContactPhone")} />
                  </Field>
                </div>
                <Field label="Email" error={errors.newContactEmail?.message}>
                  <Input type="email" {...register("newContactEmail")} />
                </Field>
              </div>
            )}
          </section>

          {/* Site */}
          <section className="space-y-3">
            <SectionLabel>Site</SectionLabel>
            <Field
              label="Address line 1"
              required
              error={errors.addressLine1?.message}
            >
              <Input
                placeholder="e.g. Plot 2, Mobberley Road"
                {...register("addressLine1")}
              />
            </Field>
            <Field label="Address line 2">
              <Input {...register("addressLine2")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Town" required error={errors.town?.message}>
                <Input {...register("town")} />
              </Field>
              <Field
                label="Postcode"
                required
                error={errors.postcode?.message}
              >
                <Input {...register("postcode")} />
              </Field>
            </div>
            <Field label="Access notes">
              <Textarea rows={2} {...register("accessNotes")} />
            </Field>
          </section>

          {/* Project */}
          <section className="space-y-3">
            <SectionLabel>Project</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Project type" required>
                <Controller
                  control={control}
                  name="projectType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_TYPES.map((p) => (
                          <SelectItem
                            key={p}
                            value={p}
                            className="capitalize"
                          >
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field
                label="Screed type"
                required
                error={errors.screedType?.message}
              >
                <Controller
                  control={control}
                  name="screedType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        {screedTypes.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Area (m²)"
                required
                error={errors.areaM2?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register("areaM2")}
                />
              </Field>
              <Field
                label="Depth (mm)"
                required
                error={errors.depthMm?.message}
              >
                <Input
                  type="number"
                  inputMode="numeric"
                  {...register("depthMm")}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target date">
                <Input type="date" {...register("targetDate")} />
              </Field>
              <Field label="Source">
                <Input
                  placeholder="e.g. Website enquiry"
                  {...register("source")}
                />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea
                rows={2}
                placeholder="Anything useful for quoting…"
                {...register("notes")}
              />
            </Field>
          </section>

          <DialogFooter className="border-t border-slate-100 pt-4">
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Log enquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
      {children}
    </h3>
  );
}
