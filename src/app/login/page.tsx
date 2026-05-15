import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(245,158,11,0.12),transparent)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="flex justify-center">
            <Image
              src="/clockwork-screed-logo.webp"
              alt="Clockwork Screed"
              width={1000}
              height={289}
              priority
              className="h-auto w-56"
            />
          </div>

          <div className="mt-7 text-center">
            <h1 className="text-lg font-semibold text-slate-800">
              Operations platform
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter the team password to continue.
            </p>
          </div>

          <LoginForm from={from ?? ""} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Liquid floor screed &amp; poured insulation · Stockport
        </p>
      </div>
    </main>
  );
}
