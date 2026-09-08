import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { GOOGLE_SETTINGS_KEY } from "@/lib/google-settings";

const optionalId = (pattern: RegExp, message: string) => z.string().trim().max(80).refine((value) => !value || pattern.test(value), message);
const schema = z.object({
  ga4Enabled: z.boolean(),
  ga4MeasurementId: optionalId(/^G-[A-Z0-9]+$/i, "GA4 ID повинен мати формат G-XXXXXXXXXX"),
  googleAdsEnabled: z.boolean(),
  googleAdsId: optionalId(/^AW-\d+$/, "Google Ads ID повинен мати формат AW-123456789"),
  leadConversionLabel: optionalId(/^[A-Za-z0-9_-]+$/, "Некоректний label конверсії заявки"),
  phoneConversionLabel: optionalId(/^[A-Za-z0-9_-]+$/, "Некоректний label конверсії дзвінка"),
  consentBannerEnabled: z.boolean(),
  searchConsoleVerification: z.string().trim().max(255).regex(/^[A-Za-z0-9_-]*$/, "Некоректний код Google Search Console"),
  bingSiteVerification: z.string().trim().max(255).regex(/^[A-Za-z0-9_-]*$/, "Некоректний код Bing Webmaster Tools"),
}).superRefine((value, context) => {
  if (value.ga4Enabled && !value.ga4MeasurementId) context.addIssue({ code: "custom", path: ["ga4MeasurementId"], message: "Вкажіть GA4 Measurement ID" });
  if (value.googleAdsEnabled && !value.googleAdsId) context.addIssue({ code: "custom", path: ["googleAdsId"], message: "Вкажіть Google Ads ID" });
  if (value.googleAdsEnabled && !value.leadConversionLabel) context.addIssue({ code: "custom", path: ["leadConversionLabel"], message: "Вкажіть label конверсії заявки" });
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 422 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: false, message: "PostgreSQL недоступний" }, { status: 503 });
  await prisma.siteSetting.upsert({
    where: { key: GOOGLE_SETTINGS_KEY },
    create: { key: GOOGLE_SETTINGS_KEY, value: parsed.data as unknown as Prisma.InputJsonValue },
    update: { value: parsed.data as unknown as Prisma.InputJsonValue },
  });
  return NextResponse.json({ ok: true });
}
