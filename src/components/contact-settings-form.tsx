"use client";

import { useState } from "react";
import type { SiteContacts } from "@/lib/site-contacts";

export function ContactSettingsForm({ contacts }: { contacts: SiteContacts }) {
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  return <form className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7" onSubmit={async(event)=>{event.preventDefault();setState("saving");setMessage("");const payload=Object.fromEntries(new FormData(event.currentTarget));try{const response=await fetch("/api/admin/contacts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const data=await response.json() as {ok?:boolean;message?:string};if(!response.ok||!data.ok)throw new Error(data.message??"Не вдалося зберегти");setState("success");setMessage("Контакти збережено. Сайт використовуватиме нові значення.");}catch(error){setState("error");setMessage(error instanceof Error?error.message:"Помилка");}}}>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-semibold text-white/55">Телефон — як показувати<input className="input" name="phoneDisplay" defaultValue={contacts.phoneDisplay} required/></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Телефон для кліка<input className="input font-mono" name="phoneHref" defaultValue={contacts.phoneHref} required inputMode="tel"/><span className="text-[11px] text-white/35">Наприклад: +380732610965</span></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Email<input className="input" name="email" type="email" defaultValue={contacts.email} required/></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Telegram URL<input className="input" name="telegramUrl" type="url" defaultValue={contacts.telegramUrl} required/></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55 md:col-span-2">Instagram URL<input className="input" name="instagramUrl" type="url" defaultValue={contacts.instagramUrl} required/></label>
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={state==="saving"} className="rounded-xl bg-[#ff6b00] px-5 py-2.5 text-sm font-bold disabled:opacity-50">{state==="saving"?"Збереження…":"Зберегти контакти"}</button>{message&&<p role="status" className={`text-sm ${state==="error"?"text-rose-300":"text-emerald-300"}`}>{message}</p>}</div>
  </form>;
}
