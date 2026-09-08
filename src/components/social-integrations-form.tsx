"use client";

import { useState } from "react";
import type { SocialChannel } from "@prisma/client";
import type { SocialCredentialField } from "@/lib/social-credentials";

type Props = { configured: Record<SocialChannel, boolean>; masks: Record<SocialCredentialField, string | null> };

async function request(payload: object) {
  const response = await fetch("/api/admin/autoposting/integrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json() as { ok?: boolean; message?: string };
  if (!response.ok || !result.ok) throw new Error(result.message ?? "Операцію не виконано");
  return result.message ?? "Готово";
}

function Status({ active, label }: { active: boolean; label?: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{label ? `${label}: ` : ""}{active ? "підключено" : "не налаштовано"}</span>;
}

function Field({ label, name, mask, secret = false, hint }: { label: string; name: SocialCredentialField; mask: string | null; secret?: boolean; hint?: string }) {
  return <label className="grid gap-1.5 text-xs text-white/55"><span>{label}</span><input className="input" type={secret ? "password" : "text"} name={name} autoComplete="off" placeholder={mask ?? "Введіть значення"}/>{hint&&<span className="text-[11px] leading-5 text-white/35">{hint}</span>}</label>;
}

export function SocialIntegrationsForm({ configured, masks }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function run(payload: object) {
    setBusy(true); setError(false); setMessage("");
    try { setMessage(await request(payload)); return true; }
    catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : "Помилка"); return false; }
    finally { setBusy(false); }
  }
  return <form className="mt-6 grid gap-4" onSubmit={async(event)=>{event.preventDefault();const form=event.currentTarget;const payload=Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value])=>[key,String(value)]));if(await run({action:"save",...payload})){form.reset();location.reload();}}}>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Telegram</h2><Status active={configured.TELEGRAM}/></div><div className="mt-5 grid gap-4"><Field label="Bot token" name="telegramBotToken" mask={masks.telegramBotToken} secret hint="Створюється у @BotFather. Значення ніколи не показується повністю."/><Field label="Channel ID або @username" name="telegramChannelId" mask={masks.telegramChannelId} hint="Бот має бути адміністратором каналу з правом публікації."/></div><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"TELEGRAM"})} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Telegram</button></section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Facebook та Instagram</h2><div className="flex flex-wrap gap-2"><Status label="FB" active={configured.FACEBOOK}/><Status label="IG" active={configured.INSTAGRAM}/></div></div><div className="mt-5 grid gap-4"><Field label="Facebook Page ID" name="facebookPageId" mask={masks.facebookPageId}/><Field label="Instagram Business Account ID" name="instagramBusinessAccountId" mask={masks.instagramBusinessAccountId}/><Field label="Meta Page access token" name="facebookPageAccessToken" mask={masks.facebookPageAccessToken} secret hint="Потрібен довгостроковий Page access token з дозволами для публікації."/></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"FACEBOOK"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Facebook</button><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"INSTAGRAM"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Instagram</button></div></section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 xl:col-span-2"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Viber</h2><Status active={configured.VIBER}/></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Bot token" name="viberBotToken" mask={masks.viberBotToken} secret/><Field label="Імʼя відправника" name="viberSenderName" mask={masks.viberSenderName}/><div className="md:col-span-2"><Field label="ID одержувачів через кому" name="viberBroadcastList" mask={masks.viberBroadcastList} hint="Viber дозволяє розсилку лише користувачам, які підписалися на бота."/></div></div><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"VIBER"})} className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Viber</button></section>
    </div>
    <div className="sticky bottom-4 rounded-2xl border border-white/10 bg-[#111]/95 p-4 shadow-2xl backdrop-blur"><p className="text-xs leading-5 text-white/45">Порожні поля не змінюють уже збережені значення. Токени шифруються на сервері AES-256-GCM і не повертаються у браузер.</p><div className="mt-3 flex flex-wrap items-center gap-3"><button disabled={busy} className="rounded-xl bg-[#ff6b00] px-5 py-2.5 text-sm font-bold disabled:opacity-50">{busy?"Збереження…":"Зберегти credentials"}</button>{message&&<p role="status" className={`text-sm ${error?"text-rose-300":"text-emerald-300"}`}>{message}</p>}</div></div>
  </form>;
}
