"use client";

import { useLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex shrink-0 rounded-xl border border-white/10 bg-black/35 p-1" aria-label="Мова сайту">
      {(["uk", "ru"] as const).map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => setLanguage(value)}
          aria-pressed={language === value}
          className={`premium-focus min-h-8 rounded-lg px-2 text-[10px] font-black transition sm:min-h-9 sm:px-2.5 sm:text-[11px] ${language === value ? "bg-[#ff6b00] text-white" : "text-white/55 hover:text-white"}`}
        >
          {value === "uk" ? "UA" : "RU"}
        </button>
      ))}
    </div>
  );
}
