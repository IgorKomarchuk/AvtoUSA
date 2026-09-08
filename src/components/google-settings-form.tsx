"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { GoogleTrackingSettings } from "@/lib/google-settings";
import { Button } from "./ui/button";

export function GoogleSettingsForm({ settings }: { settings: GoogleTrackingSettings }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    const payload = {
      ga4Enabled: form.get("ga4Enabled") === "on",
      ga4MeasurementId: String(form.get("ga4MeasurementId") ?? "").trim(),
      googleAdsEnabled: form.get("googleAdsEnabled") === "on",
      googleAdsId: String(form.get("googleAdsId") ?? "").trim(),
      leadConversionLabel: String(form.get("leadConversionLabel") ?? "").trim(),
      phoneConversionLabel: String(form.get("phoneConversionLabel") ?? "").trim(),
      consentBannerEnabled: form.get("consentBannerEnabled") === "on",
      searchConsoleVerification: String(form.get("searchConsoleVerification") ?? "").trim(),
      bingSiteVerification: String(form.get("bingSiteVerification") ?? "").trim(),
    };
    try {
      const response = await fetch("/api/admin/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message ?? "Не вдалося зберегти налаштування");
      setSuccess(true);
      setMessage("Налаштування збережено. Нові сторінки вже використовуватимуть їх.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Помилка збереження");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Google Analytics 4</h2><p className="mt-1 text-sm text-white/45">Перегляди сторінок, автомобілів, заявки, дзвінки та джерела трафіку.</p></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="ga4Enabled" defaultChecked={settings.ga4Enabled} className="size-5 accent-[#ff6b00]" />Увімкнути GA4</label></div>
        <label className="mt-6 grid gap-2 text-xs font-semibold text-white/55">GA4 Measurement ID<input className="input font-mono" name="ga4MeasurementId" defaultValue={settings.ga4MeasurementId} placeholder="G-XXXXXXXXXX" autoComplete="off" /></label>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Google Ads</h2><p className="mt-1 text-sm text-white/45">Конверсії успішної заявки та кліку на номер телефону.</p></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="googleAdsEnabled" defaultChecked={settings.googleAdsEnabled} className="size-5 accent-[#ff6b00]" />Увімкнути Google Ads</label></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-white/55 md:col-span-2">Google Ads ID<input className="input font-mono" name="googleAdsId" defaultValue={settings.googleAdsId} placeholder="AW-123456789" autoComplete="off" /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/55">Label конверсії заявки<input className="input font-mono" name="leadConversionLabel" defaultValue={settings.leadConversionLabel} placeholder="AbCdEfGhIjKlMn" autoComplete="off" /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/55">Label конверсії дзвінка<input className="input font-mono" name="phoneConversionLabel" defaultValue={settings.phoneConversionLabel} placeholder="Необов’язково" autoComplete="off" /></label>
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
        <label className="flex items-start gap-3"><input type="checkbox" name="consentBannerEnabled" defaultChecked={settings.consentBannerEnabled} className="mt-0.5 size-5 accent-[#ff6b00]" /><span><strong className="block">Google Consent Mode v2</strong><span className="mt-1 block text-sm leading-6 text-white/45">Рекомендовано для України та Європи. До згоди користувача analytics_storage, ad_storage, ad_user_data та ad_personalization мають значення denied.</span></span></label>
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
        <h2 className="text-xl font-bold">Індексація сайту</h2>
        <p className="mt-1 text-sm text-white/45">Коди підтвердження Google Search Console та Bing Webmaster Tools. Вставляйте лише значення атрибута content, не весь meta-тег.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-white/55">Google verification code<input className="input font-mono" name="searchConsoleVerification" defaultValue={settings.searchConsoleVerification} placeholder="Необов’язково" autoComplete="off" /></label>
          <label className="grid gap-2 text-xs font-semibold text-white/55">Bing verification code<input className="input font-mono" name="bingSiteVerification" defaultValue={settings.bingSiteVerification} placeholder="Необов’язково" autoComplete="off" /></label>
        </div>
      </section>
      <section className="rounded-3xl border border-emerald-300/15 bg-emerald-400/[.045] p-5 text-sm text-white/60 sm:p-7"><h2 className="font-bold text-white">Події, які передаються</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2"><li>page_view — перегляд сторінки</li><li>view_item — перегляд автомобіля</li><li>generate_lead — успішна заявка</li><li>click_phone — клік на телефон</li><li>calculate_quote — перехід із калькулятора</li></ul><p className="mt-4 text-xs leading-5 text-white/40">Ім’я, телефон, email та інші персональні дані в Google не надсилаються. UTM та Google Click ID зберігаються разом із заявкою в адмінці.</p></section>
      <div className="flex flex-wrap items-center gap-4"><Button type="submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}Зберегти Google налаштування</Button>{message && <p className={`text-sm ${success ? "text-emerald-300" : "text-rose-300"}`} role="status">{message}</p>}</div>
    </form>
  );
}
