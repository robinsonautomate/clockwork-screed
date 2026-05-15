"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, FileText, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markInvoicePaid, markInvoiceSent } from "@/lib/actions/invoices";
import type { ActionResult } from "@/lib/validation";

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, message: string) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        toast.success(message);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noreferrer"
        >
          <FileText className="size-4" /> Preview PDF
        </a>
      </Button>

      {status === "draft" && (
        <Button
          variant="accent"
          disabled={pending}
          onClick={() =>
            run(() => markInvoiceSent(invoiceId), "Invoice marked as sent")
          }
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Mark as sent
        </Button>
      )}

      {(status === "sent" || status === "overdue") && (
        <Button
          disabled={pending}
          onClick={() =>
            run(() => markInvoicePaid(invoiceId), "Invoice marked as paid")
          }
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BadgeCheck className="size-4" />
          )}
          Mark as paid
        </Button>
      )}
    </div>
  );
}
