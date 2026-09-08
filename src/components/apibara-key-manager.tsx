"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import type { ApibaraKeySummary } from "@/lib/apibara-credentials";

type ResponsePayload = { ok?: boolean; message?: string; keys?: ApibaraKeySummary[] };

export function ApibaraKeyManager({ initialKeys }: { initialKeys: ApibaraKeySummary[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function action(payload: Record<string, string>, successMessage: string) {
    setBusy(`${payload.action}:${payload.id ?? "new"}`);
    setMessage("");
    const response = await fetch("/api/admin/apibara", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({})) as ResponsePayload;
    if (result.keys) setKeys(result.keys);
    setMessage(result.ok ? result.message ?? successMessage : result.message ?? "Операція не виконана");
    setBusy(null);
    return Boolean(result.ok);
  }

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await action({ action: "add", name, key: apiKey }, "Ключ зашифровано й збережено.")) {
      setName("");
      setApiKey("");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Видалити цей резервний ключ? Цю дію неможливо скасувати.")) return;
    await action({ action: "remove", id }, "Ключ видалено.");
  }

  async function test(id: string) {
    if (!window.confirm("Перевірка виконає один запит GET /usage і витратить API-запит. Продовжити?")) return;
    await action({ action: "test", id }, "Ключ працює.");
  }

  return <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
    <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
      <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-[#ff7b1a]" size={22}/><div><h2 className="font-bold">Збережені ключі</h2><p className="mt-1 text-sm leading-6 text-white/45">Усі ключі зашифровані AES-256-GCM. Сайт і API адмінки повертають лише маску.</p></div></div>
      <div className="mt-5 grid gap-3">
        {keys.map((item) => <article key={item.id} className={`rounded-2xl border p-4 ${item.active ? "border-[#ff7b1a]/45 bg-[#ff7b1a]/[.07]" : "border-white/10 bg-black/15"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex flex-wrap items-center gap-2"><strong>{item.name}</strong>{item.active && <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">АКТИВНИЙ</span>}</div><p className="mt-2 font-mono text-xs text-white/55">{item.mask}</p><p className="mt-1 text-[11px] text-white/30">{item.source === "environment" ? "Зберігається в .env сервера" : `Збережено: ${new Date(item.createdAt).toLocaleString("uk-UA")}`}</p></div>
            <div className="flex flex-wrap gap-2">
              {!item.active && <button type="button" onClick={() => action({ action: "activate", id: item.id }, "Активний ключ змінено.")} disabled={Boolean(busy)} className="premium-focus min-h-10 rounded-xl border border-white/15 px-3 text-xs font-bold hover:bg-white/[.07] disabled:opacity-40"><CheckCircle2 className="mr-1.5 inline" size={14}/>Зробити активним</button>}
              <button type="button" onClick={() => test(item.id)} disabled={Boolean(busy)} className="premium-focus min-h-10 rounded-xl border border-white/15 px-3 text-xs font-bold hover:bg-white/[.07] disabled:opacity-40">Перевірити</button>
              {item.source === "database" && <button type="button" aria-label={`Видалити ${item.name}`} onClick={() => remove(item.id)} disabled={Boolean(busy)} className="premium-focus min-h-10 rounded-xl border border-rose-300/15 px-3 text-rose-200 hover:bg-rose-400/10 disabled:opacity-40"><Trash2 size={15}/></button>}
            </div>
          </div>
        </article>)}
        {!keys.length && <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm text-amber-100">Жодного ключа немає. До додавання ключа синхронізація працювати не буде.</p>}
      </div>
      {busy && <p className="mt-4 flex items-center gap-2 text-sm text-white/45"><LoaderCircle className="animate-spin" size={16}/>Виконується…</p>}
      {message && <p className="mt-4 rounded-xl border border-white/10 bg-white/[.04] p-4 text-sm text-white/70" role="status">{message}</p>}
    </section>
    <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
      <div className="flex items-center gap-3"><KeyRound className="text-[#ff7b1a]" size={22}/><h2 className="font-bold">Додати резервний ключ</h2></div>
      <form onSubmit={add} className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-white/60">Назва<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={60} placeholder="Наприклад, Основний акаунт" className="premium-focus min-h-12 rounded-xl border border-white/10 bg-black/25 px-4 text-white"/></label>
        <label className="grid gap-2 text-sm text-white/60">API key<input type="password" autoComplete="new-password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required minLength={20} maxLength={300} placeholder="ak_live_••••••••" className="premium-focus min-h-12 rounded-xl border border-white/10 bg-black/25 px-4 font-mono text-white"/></label>
        <button type="submit" disabled={Boolean(busy)} className="premium-focus min-h-12 rounded-xl bg-[#ff6a00] px-5 font-bold text-white transition hover:bg-[#ff7b1a] disabled:opacity-40">Зашифрувати та зберегти</button>
      </form>
      <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[.055] p-4 text-sm leading-6 text-amber-100/80"><strong className="text-amber-100">Важливо.</strong> Резервні ключі перемикаються лише вручну. Не використовуйте кілька акаунтів для обходу місячних лімітів Apibara — для більшого обсягу потрібен відповідний тариф постачальника.</div>
    </section>
  </div>;
}
