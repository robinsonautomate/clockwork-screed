"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { updateContact } from "@/lib/actions/contacts";
import { contactSchema, type ContactInput } from "@/lib/validation";

const ROLES = [
  "self-builder",
  "developer",
  "main contractor",
  "architect",
] as const;

type ContactValues = {
  id: string;
  name: string;
  company: string | null;
  role: ContactInput["role"];
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export function EditContactDialog({ contact }: { contact: ContactValues }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact.name,
      company: contact.company ?? "",
      role: contact.role,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      notes: contact.notes ?? "",
    },
  });

  async function onSubmit(values: ContactInput) {
    const res = await updateContact(contact.id, values);
    if (res.ok) {
      toast.success("Contact updated");
      setOpen(false);
      router.refresh();
    } else {
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
        <Button variant="outline">
          <Pencil className="size-4" /> Edit contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
          <DialogDescription>Update this contact’s details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="Name"
            htmlFor="edit-name"
            required
            error={errors.name?.message}
          >
            <Input id="edit-name" {...register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Company"
              htmlFor="edit-company"
              error={errors.company?.message}
            >
              <Input id="edit-company" {...register("company")} />
            </Field>
            <Field label="Role" required error={errors.role?.message}>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
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
              label="Email"
              htmlFor="edit-email"
              error={errors.email?.message}
            >
              <Input id="edit-email" type="email" {...register("email")} />
            </Field>
            <Field
              label="Phone"
              htmlFor="edit-phone"
              error={errors.phone?.message}
            >
              <Input id="edit-phone" {...register("phone")} />
            </Field>
          </div>

          <Field label="Notes" htmlFor="edit-notes" error={errors.notes?.message}>
            <Textarea id="edit-notes" rows={2} {...register("notes")} />
          </Field>

          <DialogFooter>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
