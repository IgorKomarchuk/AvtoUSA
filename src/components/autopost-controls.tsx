"use client";

import { useState } from "react";
import type { SocialChannel } from "@prisma/client";
import { Button } from "./ui/button";
import type { PublicationFilterConfig } from "@/lib/publication-quality";

async function action(payload: object) {
  const response = await fetch("/api/admin/autoposting", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json() as { ok?: boolean; message?: string };
  if (!response.ok || !result.ok) throw new Error(result.message ?? "Операцію не виконано");
}

export function ModeControl({ mode }: { mode: string }) {
  const [busy, setBusy] = useState(false);
  return <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-white/50">Режим:</span>{["manual", "auto"].map((value) => <button key={value} disabled={busy} className={`rounded-xl border px-4 py-2 text-sm font-bold uppercase ${mode === value ? "border-[#ff6b00] bg-[#ff6b00]/15 text-[#ff9a52]" : "border-white/10 text-white/55"}`} onClick={async()=>{setBusy(true);await action({action:"mode",mode:value}).finally(()=>setBusy(false));location.reload();}}>{value}</button>)}</div>;
}

export function ChannelControl({ channel, enabled, dailyLimit, timeWindows, configured }: { channel: SocialChannel; enabled: boolean; dailyLimit: number; timeWindows: string[]; configured: boolean }) {
  const [message,setMessage]=useState("");
  return <form className="rounded-2xl border border-white/10 bg-black/20 p-4" onSubmit={async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);try{await action({action:"channel",channel,enabled:form.get("enabled")==="on",dailyLimit:Number(form.get("dailyLimit")),timeWindows:String(form.get("timeWindows")).split(",").map(v=>v.trim()).filter(Boolean)});setMessage("Збережено");}catch(error){setMessage(error instanceof Error?error.message:"Помилка");}}}><div className="flex items-center justify-between gap-3"><strong>{channel}</strong><span className={`text-xs font-bold ${configured?"text-emerald-300":"text-amber-300"}`}>{configured?"Підключено":"Немає credentials"}</span></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={enabled} className="size-4 accent-[#ff6b00]"/>Автопублікація ON</label><label className="mt-3 grid gap-1 text-xs text-white/50">Ліміт на день<input className="input" name="dailyLimit" type="number" min="0" max="20" defaultValue={dailyLimit}/></label><label className="mt-3 grid gap-1 text-xs text-white/50">Часові вікна через кому<input className="input" name="timeWindows" defaultValue={timeWindows.join(", ")}/></label><button className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">Зберегти</button>{message&&<span className="ml-3 text-xs text-white/50">{message}</span>}</form>;
}

export function PublicationFilters({ filters }: { filters: PublicationFilterConfig }) {
  const [message,setMessage]=useState("");
  const list=(value:FormDataEntryValue|null)=>String(value??"").split(",").map(item=>item.trim()).filter(Boolean);
  return <form className="mt-6 rounded-3xl border border-white/10 bg-white/[.035] p-5" onSubmit={async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);try{await action({action:"filters",minYear:Number(form.get("minYear")),maxPrice:String(form.get("maxPrice")??"").trim()?Number(form.get("maxPrice")):null,minPhotos:Number(form.get("minPhotos")),allowedMakes:list(form.get("allowedMakes")),excludedMakes:list(form.get("excludedMakes")),allowedDamages:list(form.get("allowedDamages"))});setMessage("Фільтр збережено");}catch(error){setMessage(error instanceof Error?error.message:"Помилка");}}}><h2 className="font-bold">Фільтр якості</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="grid gap-1 text-xs text-white/50">Мінімальний рік<input className="input" name="minYear" type="number" min="1900" max="2100" defaultValue={filters.minYear}/></label><label className="grid gap-1 text-xs text-white/50">Максимальна ціна, USD<input className="input" name="maxPrice" type="number" min="1" defaultValue={filters.maxPrice??""} placeholder="Без обмеження"/></label><label className="grid gap-1 text-xs text-white/50">Мінімум фото<input className="input" name="minPhotos" type="number" min="1" max="30" defaultValue={filters.minPhotos}/></label><label className="grid gap-1 text-xs text-white/50">Дозволені марки<input className="input" name="allowedMakes" defaultValue={filters.allowedMakes.join(", ")} placeholder="BMW, Audi"/></label><label className="grid gap-1 text-xs text-white/50">Виключені марки<input className="input" name="excludedMakes" defaultValue={filters.excludedMakes.join(", ")} placeholder="Наприклад, Fiat"/></label><label className="grid gap-1 text-xs text-white/50">Дозволені пошкодження<input className="input" name="allowedDamages" defaultValue={filters.allowedDamages.join(", ")} placeholder="Front End, Side"/></label></div><button className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">Зберегти фільтр</button>{message&&<span className="ml-3 text-xs text-white/50">{message}</span>}</form>;
}

export function CandidateActions({ vehicleId, decision }: { vehicleId: string; decision: string }) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  const [channels,setChannels]=useState<SocialChannel[]>(["TELEGRAM"]);
  async function run(payload:object){setBusy(true);setMessage("");try{await action(payload);location.reload();}catch(error){setMessage(error instanceof Error?error.message:"Помилка");setBusy(false);}}
  return <div className="mt-4"><div className="flex flex-wrap gap-3">{(["TELEGRAM","FACEBOOK","INSTAGRAM","VIBER"] as SocialChannel[]).map(channel=><label key={channel} className="flex items-center gap-1.5 text-[11px] text-white/55"><input type="checkbox" checked={channels.includes(channel)} onChange={()=>setChannels(current=>current.includes(channel)?current.filter(item=>item!==channel):[...current,channel])} className="accent-[#ff6b00]"/>{channel}</label>)}</div><div className="mt-3 flex flex-wrap gap-2"><button disabled={busy} className="rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300" onClick={()=>run({action:"decision",vehicleId,decision:"APPROVED"})}>{decision==="APPROVED"?"Схвалено":"Схвалити"}</button><button disabled={busy} className="rounded-xl bg-white/[.06] px-3 py-2 text-xs font-bold" onClick={()=>run({action:"decision",vehicleId,decision:"EXCLUDED"})}>Виключити</button><button disabled={busy||!channels.length} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold" onClick={()=>run({action:"queue",vehicleId,channels,publishNow:false})}>У чергу</button><button disabled={busy||!channels.length} className="rounded-xl bg-[#ff6b00] px-3 py-2 text-xs font-bold" onClick={()=>run({action:"queue",vehicleId,channels,publishNow:true})}>Опублікувати зараз</button>{message&&<p className="w-full text-xs text-rose-300">{message}</p>}</div></div>;
}

export function QueueActions({ publicationId }: { publicationId: string }) {
  const [busy,setBusy]=useState(false);
  const [scheduledAt,setScheduledAt]=useState("");
  async function run(operation:string){if(operation==="delete"&&!window.confirm("Видалити цей запис із черги? Історія публікації буде втрачена."))return;setBusy(true);try{await action({action:"publication",publicationId,operation,...(operation==="reschedule"&&scheduledAt?{scheduledAt:new Date(scheduledAt).toISOString()}:{})});location.reload();}finally{setBusy(false)}}
  return <div className="grid min-w-52 gap-2"><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>run("publish_now")} className="rounded-lg bg-[#ff6b00] px-2.5 py-1.5 text-xs font-bold">Зараз</button><button disabled={busy} onClick={()=>run("retry")} className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold">Повторити</button><button disabled={busy} onClick={()=>run("cancel")} className="rounded-lg bg-rose-400/10 px-2.5 py-1.5 text-xs font-bold text-rose-300">Скасувати</button><button disabled={busy} onClick={()=>run("delete")} className="rounded-lg bg-rose-500/20 px-2.5 py-1.5 text-xs font-bold text-rose-200">Видалити</button></div><div className="flex gap-2"><input type="datetime-local" value={scheduledAt} onChange={event=>setScheduledAt(event.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs"/><button disabled={busy||!scheduledAt} onClick={()=>run("reschedule")} className="rounded-lg bg-white/10 px-2 text-xs font-bold">Змінити</button></div></div>;
}

export function TemplateEditor({ channel, body }: { channel: SocialChannel; body: string }) {
  const [message,setMessage]=useState("");
  return <form className="rounded-3xl border border-white/10 bg-white/[.035] p-5" onSubmit={async(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);try{await action({action:"template",channel,body:String(form.get("body"))});setMessage("Шаблон збережено");}catch(error){setMessage(error instanceof Error?error.message:"Помилка");}}}><h2 className="font-bold">{channel}</h2><textarea className="input mt-4 min-h-72 resize-y font-mono text-sm leading-6" name="body" defaultValue={body}/><div className="mt-3 flex items-center gap-3"><Button type="submit">Зберегти шаблон</Button>{message&&<span className="text-xs text-white/50">{message}</span>}</div></form>;
}

export function RunAutopostButton() {
  const [message,setMessage]=useState("");
  return <div className="flex flex-wrap gap-3"><Button onClick={async()=>{try{await action({action:"find"});setMessage("Кандидатів перевірено, чергу оновлено");}catch(error){setMessage(error instanceof Error?error.message:"Помилка")}}}>Знайти кандидатів</Button><button className="rounded-[14px] border border-white/15 bg-white/[.06] px-5 text-sm font-bold" onClick={async()=>{try{await action({action:"process"});setMessage("Чергу оброблено");}catch(error){setMessage(error instanceof Error?error.message:"Помилка")}}}>Обробити чергу</button>{message&&<p className="w-full text-sm text-white/55">{message}</p>}</div>;
}
