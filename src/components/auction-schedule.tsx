"use client";

import { CalendarClock, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

type AuctionScheduleProps = {
  auctionDate?: Date | string | null;
  compact?: boolean;
};

const KYIV_TIME_ZONE = "Europe/Kyiv";

function formatAuctionDate(value: Date, language: "uk" | "ru") {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-UA" : "uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: KYIV_TIME_ZONE,
  }).format(value);
}

function formatCountdown(milliseconds: number, language: "uk" | "ru") {
  if (milliseconds <= 0) return language === "ru" ? "Торги уже начались" : "Торги вже розпочалися";

  const totalMinutes = Math.floor(milliseconds / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days > 0 ? `${days} д` : null,
    `${hours} ${language === "ru" ? "ч" : "год"}`,
    `${minutes} ${language === "ru" ? "мин" : "хв"}`,
  ].filter(Boolean);

  return `${language === "ru" ? "До торгов" : "До торгів"}: ${parts.join(" ")}`;
}

export function AuctionSchedule({ auctionDate, compact = false }: AuctionScheduleProps) {
  const { language } = useLanguage();
  const [now, setNow] = useState<number | null>(null);
  const date = auctionDate ? new Date(auctionDate) : null;

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!date || Number.isNaN(date.getTime())) {
    return <span className="text-white/45">{language === "ru" ? "Время уточняется" : "Час уточнюється"}</span>;
  }

  const dateTime = date.toISOString();
  const countdown = now == null
    ? (language === "ru" ? "Расчет времени…" : "Розрахунок часу…")
    : formatCountdown(date.getTime() - now, language);

  if (compact) {
    return (
      <div className="col-span-2 grid gap-1.5 rounded-xl bg-white/[.035] p-3">
        <time dateTime={dateTime} className="flex items-center gap-2 text-white/65">
          <CalendarClock size={14} className="shrink-0 text-[#ff7b1a]" />
          {formatAuctionDate(date, language)}
        </time>
        <span className="flex items-center gap-2 font-bold text-white/90">
          <Timer size={14} className="shrink-0 text-[#ff7b1a]" />
          {countdown}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#ff7b1a]/25 bg-[#ff7b1a]/[.07] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.1em] text-[#ff9b54]">
        <CalendarClock size={15} />{language === "ru" ? "Время аукциона" : "Час аукціону"}
      </p>
      <time dateTime={dateTime} className="mt-2 block text-base font-bold text-white">
        {formatAuctionDate(date, language)} <span className="text-xs font-medium text-white/45">{language === "ru" ? "по Киеву" : "за Києвом"}</span>
      </time>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
        <Timer size={15} className="text-[#ff7b1a]" />{countdown}
      </p>
    </div>
  );
}
