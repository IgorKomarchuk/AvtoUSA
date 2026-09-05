"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "./ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
    const payload = await response.json().catch(() => ({})) as { message?: string };
    if (!response.ok) { setError(payload.message ?? "Не вдалося увійти"); setLoading(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <form onSubmit={submit} className="mt-8 grid gap-4"><label className="grid gap-2 text-xs font-semibold text-white/55">Email<input className="input" name="email" type="email" autoComplete="username" required /></label><label className="grid gap-2 text-xs font-semibold text-white/55">Пароль<input className="input" name="password" type="password" autoComplete="current-password" minLength={8} required /></label><Button type="submit" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" size={17} /> : <LogIn size={17} />}{loading ? "Входимо…" : "Увійти"}</Button>{error && <p className="text-sm text-rose-300" role="alert">{error}</p>}</form>;
}
