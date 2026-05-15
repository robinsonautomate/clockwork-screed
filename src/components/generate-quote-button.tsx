"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateQuote } from "@/lib/actions/quotes";

export function GenerateQuoteButton({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [, setDone] = useState(false);

  function onClick() {
    startTransition(async () => {
      const res = await generateQuote(enquiryId);
      if (res.ok && res.data) {
        setDone(true);
        toast.success("Draft quote created");
        router.push(`/quotes/${res.data.id}`);
      } else if (!res.ok) {
        toast.error(res.error);
      }
    });
  }

  return (
    <Button variant="accent" onClick={onClick} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileText className="size-4" />
      )}
      Generate quote
    </Button>
  );
}
