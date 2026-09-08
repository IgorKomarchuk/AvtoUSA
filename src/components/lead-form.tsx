"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "./ui/button";
import { trackLeadConversion } from "@/lib/analytics";

export interface LeadVehicleContext {
  vehicleId?: string;
  vin?: string | null;
  lotNumber?: string;
  vehicleTitle?: string;
  price?: string;
  vehicleUrl?: string;
  source?: string;
}

export function LeadForm({ vehicle, compact = false }: { vehicle?: LeadVehicleContext; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setState("sending");
    setMessage("");
    const form = new FormData(formElement);
    const query = new URLSearchParams(window.location.search);
    const utmSource = query.get("utm_source") ?? "";
    const referrerHost = (() => { try { return document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ""; } catch { return ""; } })();
    const normalizedSource = utmSource.toLowerCase();
    const sourceChannel = ["telegram", "facebook", "instagram", "viber"].includes(normalizedSource) ? normalizedSource : normalizedSource.includes("google") || referrerHost.includes("google.") ? "google" : "direct";
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      messenger: form.get("messenger"),
      interest: form.get("interest"),
      website: form.get("website"),
      vehicleId: vehicle?.vehicleId,
      vin: vehicle?.vin,
      lotNumber: vehicle?.lotNumber,
      vehicleTitle: vehicle?.vehicleTitle,
      price: vehicle?.price,
      vehicleUrl: vehicle?.vehicleUrl ? new URL(vehicle.vehicleUrl, window.location.origin).href : window.location.href,
      source: vehicle?.source ?? (vehicle ? "vehicle_detail" : "website_form"),
      sourceChannel,
      utmSource,
      utmMedium: query.get("utm_medium") ?? "",
      utmCampaign: query.get("utm_campaign") ?? "",
      utmContent: query.get("utm_content") ?? "",
      utmTerm: query.get("utm_term") ?? "",
      gclid: query.get("gclid") ?? "",
      gbraid: query.get("gbraid") ?? "",
      wbraid: query.get("wbraid") ?? "",
    };
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await response.json()) as { ok?: boolean; message?: string; conversionId?: string };
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Не вдалося надіслати заявку");
      trackLeadConversion({ form_name: vehicle ? "vehicle_quote" : "general_request", vehicle_id: vehicle?.vehicleId ?? "", source_channel: sourceChannel, transaction_id: data.conversionId ?? "" });
      setState("success");
      formElement.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Сталася помилка. Спробуйте ще раз.");
    }
  }

  if (state === "success") {
    return <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/[.07] p-8 text-center"><CheckCircle2 size={40} className="text-emerald-400" /><h3 className="mt-4 text-2xl font-bold">Дякуємо! Ми зв’яжемося з вами найближчим часом.</h3><button type="button" className="mt-4 text-sm text-white/55 underline" onClick={() => setState("idle")}>Надіслати ще одну заявку</button></div>;
  }

  return (
    <form onSubmit={submit} className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`} noValidate>
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
      <label className="grid gap-2 text-xs font-semibold text-white/55">Ім’я<input className="input" name="name" required minLength={2} autoComplete="name" placeholder="Ваше ім’я" /></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Телефон<input className="input" name="phone" required minLength={7} autoComplete="tel" inputMode="tel" placeholder="+38 0__ ___ __ __" /></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Telegram / Viber<select className="input" name="messenger" defaultValue="Telegram"><option>Telegram</option><option>Viber</option><option>WhatsApp</option><option>Телефон</option></select></label>
      <label className="grid gap-2 text-xs font-semibold text-white/55">Який автомобіль цікавить<input className="input" name="interest" defaultValue={vehicle?.vehicleTitle ?? ""} placeholder="Наприклад, BMW X5 2021" /></label>
      <Button type="submit" disabled={state === "sending"} className={compact ? "w-full" : "sm:col-span-2"}>
        {state === "sending" ? <><LoaderCircle size={17} className="animate-spin" />Надсилаємо…</> : <>Надіслати заявку <ArrowRight size={17} /></>}
      </Button>
      {state === "error" && <p className={`text-sm text-rose-300 ${compact ? "" : "sm:col-span-2"}`} role="alert">{message}</p>}
      <p className={`text-[11px] leading-5 text-white/35 ${compact ? "" : "sm:col-span-2"}`}>Надсилаючи форму, ви погоджуєтеся з політикою конфіденційності та обробкою персональних даних.</p>
    </form>
  );
}
