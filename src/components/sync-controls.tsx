"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export function SyncControls() {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function run(provider: "all" | "copart" | "iaai") {
    if (!window.confirm("Синхронізація використовує 1 API-запит. Продовжити?")) return;
    setBusy(provider); setMessage("");
    const response = await fetch("/api/admin/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider }) });
    const payload = await response.json().catch(() => ({})) as { result?: { status: string; receivedRecords: number; createdRecords: number; updatedRecords: number; errorMessage?: string }; message?: string };
    const result = payload.result;
    setMessage(result ? `${result.status}: отримано ${result.receivedRecords}, додано ${result.createdRecords}, оновлено ${result.updatedRecords}${result.errorMessage ? `. ${result.errorMessage}` : ""}` : payload.message ?? "Операцію завершено");
    setBusy(null);
  }
  async function usage() {
    if (!window.confirm("Оновлення ліміту виконає окремий запит до GET /usage. Продовжити?")) return;
    setBusy("usage"); setMessage("");
    const response = await fetch("/api/admin/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "usage" }) });
    const payload = await response.json().catch(() => ({})) as { ok?: boolean; usage?: { used: number | null; remaining: number | null }; message?: string };
    setMessage(payload.ok ? `Ліміт оновлено: використано ${payload.usage?.used ?? "—"}, залишилось ${payload.usage?.remaining ?? "—"}.` : payload.message ?? "Не вдалося оновити ліміт");
    setBusy(null);
  }
  return <div><div className="flex flex-wrap gap-3"><Button onClick={() => run("all")} disabled={Boolean(busy)}><RefreshCw className={busy === "all" ? "animate-spin" : ""} size={17} />Оновити автомобілі зараз</Button><button type="button" onClick={() => run("copart")} disabled={Boolean(busy)} className="premium-focus min-h-12 rounded-[14px] border border-white/15 px-5 text-sm font-bold hover:bg-white/[.06] disabled:opacity-40">Лише Copart</button><button type="button" onClick={() => run("iaai")} disabled={Boolean(busy)} className="premium-focus min-h-12 rounded-[14px] border border-white/15 px-5 text-sm font-bold hover:bg-white/[.06] disabled:opacity-40">Лише IAAI</button><button type="button" onClick={usage} disabled={Boolean(busy)} className="premium-focus min-h-12 rounded-[14px] border border-white/15 px-5 text-sm font-bold hover:bg-white/[.06] disabled:opacity-40">Оновити API usage</button></div>{message && <p className="mt-4 rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm text-white/65" role="status">{message}</p>}</div>;
}
