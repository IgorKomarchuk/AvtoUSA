"use client";

import { useState } from "react";
import type { SocialChannel } from "@prisma/client";
import type { SocialCredentialField, SocialIntegrationCheck } from "@/lib/social-credentials";

type Props = { configured: Record<SocialChannel, boolean>; telegramLeadsConfigured: boolean; masks: Record<SocialCredentialField, string | null>; checks: Partial<Record<SocialChannel, SocialIntegrationCheck>> };

async function request(payload: object) {
  const response = await fetch("/api/admin/autoposting/integrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json() as { ok?: boolean; message?: string; externalPostUrl?: string | null };
  if (!response.ok || !result.ok) throw new Error(result.message ?? "Операцію не виконано");
  return result.message ?? "Готово";
}

function Status({ active, label }: { active: boolean; label?: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>{label ? `${label}: ` : ""}{active ? "підключено" : "не налаштовано"}</span>;
}

function CheckResult({ check }: { check?: SocialIntegrationCheck }) {
  if (!check) return <p className="mt-3 text-xs text-white/35">Ще не перевірялося.</p>;
  return <div className={`mt-3 rounded-xl border p-3 text-xs leading-5 ${check.ok ? "border-emerald-400/15 bg-emerald-400/[.06] text-emerald-200" : "border-rose-400/15 bg-rose-400/[.06] text-rose-200"}`}>
    <strong>{check.ok ? "Перевірка успішна" : "Помилка перевірки"}</strong>
    <p>{check.message}</p>
    <p className="opacity-60">{new Date(check.checkedAt).toLocaleString("uk-UA")} · {check.kind === "publication" ? "тестова публікація" : "з’єднання"}</p>
    {check.externalPostUrl && <a href={check.externalPostUrl} target="_blank" rel="noreferrer" className="font-bold underline">Відкрити тестовий пост</a>}
  </div>;
}

function Field({ label, name, mask, secret = false, hint }: { label: string; name: SocialCredentialField; mask: string | null; secret?: boolean; hint?: string }) {
  return <label className="grid gap-1.5 text-xs text-white/55"><span>{label}</span><input className="input" type={secret ? "password" : "text"} name={name} autoComplete="off" placeholder={mask ?? "Введіть значення"}/>{hint&&<span className="text-[11px] leading-5 text-white/35">{hint}</span>}</label>;
}

export function SocialIntegrationsForm({ configured, telegramLeadsConfigured, masks, checks }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function run(payload: object) {
    setBusy(true); setError(false); setMessage("");
    try { setMessage(await request(payload)); return true; }
    catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : "Помилка"); return false; }
    finally { setBusy(false); }
  }
  async function copyTelegramDestination(from: "autoposts" | "leads") {
    if (!window.confirm("Використовувати одну Telegram-групу для автокарток і заявок?")) return;
    if (await run({ action: "telegram_copy_destination", from })) location.reload();
  }
  return <form className="mt-6 grid gap-4" onSubmit={async(event)=>{event.preventDefault();const form=event.currentTarget;const payload=Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value])=>[key,String(value)]));if(await run({action:"save",...payload})){form.reset();location.reload();}}}>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Telegram</h2><div className="flex flex-wrap gap-2"><Status label="Автопости" active={configured.TELEGRAM}/><Status label="Заявки" active={telegramLeadsConfigured}/></div></div>{!telegramLeadsConfigured&&<div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[.08] p-3 text-xs leading-5 text-amber-100">Заявки зберігаються в адмінці, але не можуть надсилатися менеджеру, доки не вказано Chat ID для заявок.</div>}<div className="mt-5 grid gap-4"><Field label="Bot token" name="telegramBotToken" mask={masks.telegramBotToken} secret hint="Створюється у @BotFather. Значення ніколи не показується повністю."/><Field label="Telegram-група або канал для автоматичних карток" name="telegramChannelId" mask={masks.telegramChannelId} hint="Для приватної групи вкажіть числовий Chat ID (зазвичай починається з -100). Для публічного каналу можна вказати @username. Бот повинен мати право надсилати повідомлення."/><Field label="Telegram-група для заявок із сайту" name="telegramLeadChatId" mask={masks.telegramLeadChatId} hint="Вкажіть Chat ID групи, куди мають надходити ім’я, телефон і дані автомобіля."/></div><div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-xs leading-5 text-white/50">Хочете отримувати автокартки та заявки в одній групі? Скопіюйте вже збережену адресу без повторного введення Chat ID.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy||!telegramLeadsConfigured} onClick={()=>copyTelegramDestination("leads")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/[.06] disabled:opacity-40">Групу заявок → для автопостів</button><button type="button" disabled={busy||!configured.TELEGRAM} onClick={()=>copyTelegramDestination("autoposts")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/[.06] disabled:opacity-40">Групу автопостів → для заявок</button></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"TELEGRAM"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити обидві Telegram-групи</button><button type="button" disabled={busy} onClick={()=>window.confirm("Надіслати позначену TEST-картку з реальним авто у вибрану Telegram-групу автопостів?")&&run({action:"test_publication",channel:"TELEGRAM"})} className="rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-bold">Надіслати TEST-картку</button></div><CheckResult check={checks.TELEGRAM}/></section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Facebook та Instagram</h2><div className="flex flex-wrap gap-2"><Status label="FB" active={configured.FACEBOOK}/><Status label="IG" active={configured.INSTAGRAM}/></div></div><div className="mt-5 grid gap-4"><Field label="Facebook Page ID" name="facebookPageId" mask={masks.facebookPageId}/><Field label="Instagram Business Account ID" name="instagramBusinessAccountId" mask={masks.instagramBusinessAccountId}/><Field label="Meta Page access token" name="facebookPageAccessToken" mask={masks.facebookPageAccessToken} secret hint="Потрібен довгостроковий Page access token з дозволами для публікації."/></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"FACEBOOK"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Facebook</button><button type="button" disabled={busy} onClick={()=>window.confirm("Опублікувати позначений TEST-пост у Facebook?")&&run({action:"test_publication",channel:"FACEBOOK"})} className="rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-bold">TEST Facebook</button><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"INSTAGRAM"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Instagram</button><button type="button" disabled={busy} onClick={()=>window.confirm("Опублікувати позначений TEST-пост в Instagram?")&&run({action:"test_publication",channel:"INSTAGRAM"})} className="rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-bold">TEST Instagram</button></div><CheckResult check={checks.FACEBOOK}/><CheckResult check={checks.INSTAGRAM}/></section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 xl:col-span-2"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Viber</h2><Status active={configured.VIBER}/></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Bot token" name="viberBotToken" mask={masks.viberBotToken} secret/><Field label="Імʼя відправника" name="viberSenderName" mask={masks.viberSenderName}/><div className="md:col-span-2"><Field label="ID одержувачів через кому" name="viberBroadcastList" mask={masks.viberBroadcastList} hint="Viber дозволяє розсилку лише користувачам, які підписалися на бота."/></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>run({action:"test",channel:"VIBER"})} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/[.06]">Перевірити Viber</button><button type="button" disabled={busy} onClick={()=>window.confirm("Надіслати позначений TEST-пост одержувачам Viber?")&&run({action:"test_publication",channel:"VIBER"})} className="rounded-xl bg-[#ff6b00] px-4 py-2 text-sm font-bold">Надіслати TEST-пост</button></div><CheckResult check={checks.VIBER}/></section>
    </div>
    <div className="sticky bottom-4 rounded-2xl border border-white/10 bg-[#111]/95 p-4 shadow-2xl backdrop-blur"><p className="text-xs leading-5 text-white/45">Порожні поля не змінюють уже збережені значення. Токени шифруються на сервері AES-256-GCM і не повертаються у браузер.</p><div className="mt-3 flex flex-wrap items-center gap-3"><button disabled={busy} className="rounded-xl bg-[#ff6b00] px-5 py-2.5 text-sm font-bold disabled:opacity-50">{busy?"Збереження…":"Зберегти credentials"}</button>{message&&<p role="status" className={`text-sm ${error?"text-rose-300":"text-emerald-300"}`}>{message}</p>}</div></div>
  </form>;
}
