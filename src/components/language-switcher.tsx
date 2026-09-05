"use client";

import { useLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex rounded-xl border border-white/10 bg-black/35 p-1" aria-label="Мова сайту">
      {(["uk", "ru"] as const).map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => setLanguage(value)}
          aria-pressed={language === value}
          className={`premium-focus min-h-9 rounded-lg px-2.5 text-[11px] font-black transition ${language === value ? "bg-[#ff6b00] text-white" : "text-white/55 hover:text-white"}`}
        >
          {value === "uk" ? "UA" : "RU"}
        </button>
      ))}
    </div>
  );
}
