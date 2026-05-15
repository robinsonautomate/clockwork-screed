"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveInvoiceLines } from "@/lib/actions/invoices";
import { calcTotals, lineTotal, type QuoteLineUnit } from "@/lib/quoting";
import { gbp } from "@/lib/format";

type Row = {
  key: string;
  description: string;
  qty: string;
  unit: QuoteLineUnit;
  unitPrice: string;
};

const UNITS: QuoteLineUnit[] = ["m²", "m³", "day", "item"];

let keySeq = 0;
const newKey = () => `iline-${keySeq++}`;

export function InvoiceLinesEditor({
  invoiceId,
  status,
  initialLines,
}: {
  invoiceId: string;
  status: string;
  initialLines: {
    description: string;
    qty: string;
    unit: string;
    unitPrice: string;
  }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const editable = status !== "paid";

  const [rows, setRows] = useState<Row[]>(
    initialLines.map((l) => ({
      key: newKey(),
      description: l.description,
      qty: l.qty,
      unit: l.unit as QuoteLineUnit,
      unitPrice: l.unitPrice,
    })),
  );

  const totals = calcTotals(rows);

  function update(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function remove(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key));
  }
  function move(index: number, dir: -1 | 1) {
    setRows((rs) => {
      const next = [...rs];
      const j = index + dir;
      if (j < 0 || j >= next.length) return rs;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }
  function add() {
    setRows((rs) => [
      ...rs,
      { key: newKey(), description: "", qty: "1", unit: "item", unitPrice: "0" },
    ]);
  }

  function save() {
    if (rows.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    startTransition(async () => {
      const res = await saveInvoiceLines({
        invoiceId,
        lines: rows.map((r) => ({
          description: r.description.trim(),
          qty: Number(r.qty),
          unit: r.unit,
          unitPrice: Number(r.unitPrice),
        })),
      });
      if (res.ok) {
        toast.success("Invoice updated");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-800">Line items</h2>
        {editable && (
          <Button size="sm" variant="outline" onClick={add}>
            <Plus className="size-3.5" /> Add line
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="w-8" />
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="px-2 py-2 text-right font-medium">Qty</th>
              <th className="px-2 py-2 font-medium">Unit</th>
              <th className="px-2 py-2 text-right font-medium">Unit price</th>
              <th className="px-2 py-2 text-right font-medium">Amount</th>
              {editable && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.key} className="border-b border-slate-100">
                <td className="pl-2">
                  {editable && (
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === rows.length - 1}
                        className="text-slate-300 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.description}
                    disabled={!editable}
                    onChange={(e) =>
                      update(row.key, { description: e.target.value })
                    }
                    placeholder="Description"
                    className="h-8"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.qty}
                    disabled={!editable}
                    onChange={(e) => update(row.key, { qty: e.target.value })}
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="h-8 w-20 text-right font-mono"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Select
                    value={row.unit}
                    disabled={!editable}
                    onValueChange={(val) =>
                      update(row.key, { unit: val as QuoteLineUnit })
                    }
                  >
                    <SelectTrigger className="h-8 w-[72px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.unitPrice}
                    disabled={!editable}
                    onChange={(e) =>
                      update(row.key, { unitPrice: e.target.value })
                    }
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="h-8 w-24 text-right font-mono"
                  />
                </td>
                <td className="px-2 py-1.5 text-right font-mono font-medium tabular-nums text-slate-800">
                  {gbp(lineTotal(row.qty, row.unitPrice))}
                </td>
                {editable && (
                  <td className="pr-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(row.key)}
                      className="text-slate-300 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={editable ? 7 : 6}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No line items — add one to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {editable ? (
            <Button
              size="sm"
              variant="accent"
              onClick={save}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save invoice
            </Button>
          ) : (
            <p className="text-xs text-slate-500">
              This invoice is paid and locked.
            </p>
          )}
        </div>
        <dl className="w-full max-w-[240px] space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-mono tabular-nums text-slate-700">
              {gbp(totals.subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">VAT at 20%</dt>
            <dd className="font-mono tabular-nums text-slate-700">
              {gbp(totals.vat)}
            </dd>
          </div>
          <div className="flex justify-between rounded-md bg-slate-800 px-3 py-1.5 text-white">
            <dt className="font-semibold">Total due</dt>
            <dd className="font-mono font-semibold tabular-nums">
              {gbp(totals.total)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
