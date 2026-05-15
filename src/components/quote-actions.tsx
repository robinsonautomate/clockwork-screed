"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FileText, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  acceptQuote,
  declineQuote,
  sendQuote,
} from "@/lib/actions/quotes";
import type { ActionResult } from "@/lib/validation";

export function QuoteActions({
  quoteId,
  status,
  jobId,
}: {
  quoteId: string;
  status: string;
  jobId: string | null;
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

  function onAccept() {
    startTransition(async () => {
      const res = await acceptQuote(quoteId);
      if (res.ok && res.data) {
        toast.success("Quote accepted — job scheduled");
        router.push(`/jobs/${res.data.jobId}`);
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline">
        <a
          href={`/api/quotes/${quoteId}/pdf`}
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
          onClick={() => run(() => sendQuote(quoteId), "Quote marked as sent")}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Mark as sent
        </Button>
      )}

      {(status === "draft" || status === "sent") && (
        <>
          <Button
            disabled={pending}
            onClick={onAccept}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Check className="size-4" /> Mark accepted
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              run(() => declineQuote(quoteId), "Quote marked as declined")
            }
          >
            <X className="size-4" /> Mark declined
          </Button>
        </>
      )}

      {status === "accepted" && jobId && (
        <Button asChild variant="accent">
          <Link href={`/jobs/${jobId}`}>
            View job <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
