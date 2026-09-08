import "server-only";

import { getPrisma } from "./prisma";

export const SITE_CONTACTS_KEY = "site_contacts";

export type SiteContacts = {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  telegramUrl: string;
  instagramUrl: string;
};

export const defaultSiteContacts: SiteContacts = {
  phoneDisplay: "+38 073 261 09 65",
  phoneHref: "+380732610965",
  email: "racenkodmitrij8@gmail.com",
  telegramUrl: "https://t.me/",
  instagramUrl: "https://instagram.com/",
};

export function normalizeSiteContacts(value: unknown): SiteContacts {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const text = (key: keyof SiteContacts) => typeof source[key] === "string" && source[key].trim() ? source[key].trim() : defaultSiteContacts[key];
  return { phoneDisplay: text("phoneDisplay"), phoneHref: text("phoneHref"), email: text("email"), telegramUrl: text("telegramUrl"), instagramUrl: text("instagramUrl") };
}

export async function getSiteContacts() {
  const prisma = getPrisma();
  if (!prisma) return defaultSiteContacts;
  const setting = await prisma.siteSetting.findUnique({ where: { key: SITE_CONTACTS_KEY } }).catch(() => null);
  return normalizeSiteContacts(setting?.value);
}
