"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { error: null };

export function LoginForm({ from }: { from: string }) {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="mt-7 space-y-4">
      <input type="hidden" name="from" value={from} />
      <div className="space-y-2">
        <Label htmlFor="password">Team password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="••••••••••"
          className="h-11 text-base"
          required
        />
      </div>

      {state.error && (
        <p className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        disabled={pending}
        className="h-11 w-full text-sm"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in…
          </>
        ) : (
          <>
            <LogIn className="size-4" /> Sign in
          </>
        )}
      </Button>
    </form>
  );
}
