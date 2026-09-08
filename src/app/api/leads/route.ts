import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { allowRequest } from "@/lib/rate-limit";
import { sendLeadToTelegram } from "@/lib/telegram";
import { leadSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let conversionId = crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`lead:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, message: "Забагато спроб. Спробуйте пізніше." }, { status: 429 });
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Перевірте поля форми" }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const prisma = getPrisma();
  let saved = false;
  let savedLeadId: string | null = null;
  if (prisma) {
    try {
      const lead = await prisma.lead.create({
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          messenger: parsed.data.messenger || null,
          interest: parsed.data.interest || null,
          vehicleId: parsed.data.vehicleId || null,
          vin: parsed.data.vin || null,
          lotNumber: parsed.data.lotNumber || null,
          vehicleTitle: parsed.data.vehicleTitle || null,
          vehicleUrl: parsed.data.vehicleUrl || null,
          source: parsed.data.source || null,
          sourceChannel: parsed.data.sourceChannel || null,
          utmSource: parsed.data.utmSource || null,
          utmMedium: parsed.data.utmMedium || null,
          utmCampaign: parsed.data.utmCampaign || null,
          utmContent: parsed.data.utmContent || null,
          utmTerm: parsed.data.utmTerm || null,
          gclid: parsed.data.gclid || null,
          gbraid: parsed.data.gbraid || null,
          wbraid: parsed.data.wbraid || null,
        },
      });
      conversionId = lead.id;
      savedLeadId = lead.id;
      saved = true;
    } catch {
      // Telegram remains a valid delivery fallback if database persistence fails.
    }
  }
  let delivered = false;
  let telegramError: string | null = null;
  try {
    const result = await sendLeadToTelegram(parsed.data);
    delivered = result.delivered;
    if (!result.delivered) telegramError = result.reason;
  } catch (error) {
    telegramError = error instanceof Error ? error.message : "Невідома помилка Telegram";
  }
  if (prisma && savedLeadId) {
    await prisma.lead.update({
      where: { id: savedLeadId },
      data: {
        telegramDelivered: delivered,
        telegramSentAt: delivered ? new Date() : null,
        telegramError: delivered ? null : telegramError,
      },
    }).catch(() => undefined);
  }
  if (!saved && !delivered) return NextResponse.json({ ok: false, message: "Форма ще не підключена. Налаштуйте PostgreSQL або Telegram." }, { status: 503 });
  return NextResponse.json({ ok: true, conversionId, deliveryStatus: delivered ? "telegram_sent" : "saved_in_admin" });
}
