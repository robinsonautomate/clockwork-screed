"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Field } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSite } from "@/lib/actions/enquiries";

type SiteData = {
  id: string;
  addressLine1: string;
  addressLine2: string | null;
  town: string;
  postcode: string;
  accessNotes: string | null;
};

export function SiteEditor({ site }: { site: SiteData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addressLine1, setAddressLine1] = useState(site.addressLine1);
  const [addressLine2, setAddressLine2] = useState(site.addressLine2 ?? "");
  const [town, setTown] = useState(site.town);
  const [postcode, setPostcode] = useState(site.postcode);
  const [accessNotes, setAccessNotes] = useState(site.accessNotes ?? "");

  function cancel() {
    setAddressLine1(site.addressLine1);
    setAddressLine2(site.addressLine2 ?? "");
    setTown(site.town);
    setPostcode(site.postcode);
    setAccessNotes(site.accessNotes ?? "");
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    const res = await updateSite({
      id: site.id,
      addressLine1,
      addressLine2,
      town,
      postcode,
      accessNotes,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Site updated");
      setEditing(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">Site</h2>
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
          <Field label="Address line 1" required>
            <Input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </Field>
          <Field label="Address line 2">
            <Input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Town" required>
              <Input value={town} onChange={(e) => setTown(e.target.value)} />
            </Field>
            <Field label="Postcode" required>
              <Input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="uppercase"
              />
            </Field>
          </div>
          <Field label="Access notes">
            <Textarea
              rows={2}
              value={accessNotes}
              onChange={(e) => setAccessNotes(e.target.value)}
            />
          </Field>
          <Button
            variant="accent"
            onClick={save}
            disabled={saving || !addressLine1 || !town || !postcode}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      ) : (
        <div className="space-y-1 px-4 py-3 text-sm">
          <p className="font-medium text-slate-800">{site.addressLine1}</p>
          {site.addressLine2 && <p>{site.addressLine2}</p>}
          <p className="text-slate-600">
            {site.town}, {site.postcode}
          </p>
          {site.accessNotes && (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
              Access: {site.accessNotes}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
