"use client";

export function CookieSettingsButton() {
  return <button type="button" className="text-left text-white/70 hover:text-white" onClick={() => window.dispatchEvent(new Event("brilliantcars:consent-settings"))}>Налаштування cookie</button>;
}
