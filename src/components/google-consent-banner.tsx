"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

const STORAGE_KEY = "brilliantcars-google-consent";

export function GoogleConsentBanner() {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
    const reopen = () => setVisible(true);
    window.addEventListener("brilliantcars:consent-settings", reopen);
    return () => window.removeEventListener("brilliantcars:consent-settings", reopen);
  }, []);

  function save(value: "all" | "necessary") {
    window.localStorage.setItem(STORAGE_KEY, value);
    const granted = value === "all";
    window.gtag?.("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#111311]/95 p-5 shadow-2xl backdrop-blur-xl sm:flex sm:items-center sm:gap-6" role="dialog" aria-label={language === "ru" ? "Настройки файлов cookie" : "Налаштування cookie"}>
      <div className="flex-1">
        <p className="font-bold">{language === "ru" ? "Аналитика и реклама" : "Аналітика та реклама"}</p>
        <p className="mt-1 text-xs leading-5 text-white/55">{language === "ru" ? "Google Analytics и Google Ads помогают измерять заявки и улучшать рекламу. Персональные данные из формы не передаются." : "Google Analytics і Google Ads допомагають вимірювати заявки та покращувати рекламу. Персональні дані з форми не передаються."}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:shrink-0">
        <button type="button" onClick={() => save("necessary")} className="premium-focus min-h-11 rounded-xl border border-white/15 px-4 text-xs font-bold text-white/70">{language === "ru" ? "Только необходимые" : "Лише необхідні"}</button>
        <button type="button" onClick={() => save("all")} className="premium-focus min-h-11 rounded-xl bg-[#ff6b00] px-4 text-xs font-bold text-white">{language === "ru" ? "Разрешить" : "Дозволити"}</button>
      </div>
    </aside>
  );
}
