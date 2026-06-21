"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { logoPath } from "@/config/site";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    if (res.ok) {
      const from = params.get("from") || "/admin/";
      router.push(from.startsWith("/admin") ? from : "/admin/");
      router.refresh();
    } else {
      // Never surface raw API error codes — always a friendly Czech message.
      setError(res.status === 401 ? "Nesprávný e-mail nebo heslo." : "Přihlášení selhalo. Zkuste to prosím znovu.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-base px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <img src={logoPath} alt="Viapower" className="h-7 [filter:brightness(0)_invert(1)]" />
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-red-bright">
            <Lock size={12} /> administrace
          </span>
        </div>
        <form onSubmit={onSubmit} className="brackets border border-line-strong bg-card p-8">
          <div className="mb-4 flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim">E-mail</label>
            <input id="email" name="email" type="email" required placeholder="vas@email.cz" className="border border-line-strong bg-base px-3.5 py-3 text-[15px] text-ink outline-none focus:border-red" />
          </div>
          <div className="mb-5 flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim">Heslo</label>
            <input id="password" name="password" type="password" required className="border border-line-strong bg-base px-3.5 py-3 text-[15px] text-ink outline-none focus:border-red" />
          </div>
          <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 bg-red px-5 py-3.5 font-mono text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark disabled:opacity-70">
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Přihlásit se"}
          </button>
          {error && <p className="mt-3 text-center font-mono text-[12px] text-red-bright">{error}</p>}
        </form>
        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.14em] text-ink-dim">Viapower CMS</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
