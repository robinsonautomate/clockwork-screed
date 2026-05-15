import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-20 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Compass className="size-7 text-slate-400" />
      </div>
      <h1 className="mt-3 text-lg font-semibold text-slate-800">
        Page not found
      </h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        That record doesn’t exist, or may have been removed.
      </p>
      <Button asChild variant="accent" className="mt-4">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
