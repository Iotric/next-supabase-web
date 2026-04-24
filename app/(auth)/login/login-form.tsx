"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          className="border-input w-full rounded-md border px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className="border-input w-full rounded-md border px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
