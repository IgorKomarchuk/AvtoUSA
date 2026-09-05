import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { allowRequest } from "@/lib/rate-limit";
import { sendLeadToTelegram } from "@/lib/telegram";
import { leadSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`lead:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, message: "Забагато спроб. Спробуйте пізніше." }, { status: 429 });
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Перевірте поля форми" }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const prisma = getPrisma();
  let saved = false;
  if (prisma) {
    try {
      await prisma.lead.create({
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
        },
      });
      saved = true;
    } catch {
      // Telegram remains a valid delivery fallback if database persistence fails.
    }
  }
  let delivered = false;
  try {
    delivered = (await sendLeadToTelegram(parsed.data)).delivered;
  } catch {
    // The database copy remains available for the manager.
  }
  if (!saved && !delivered) return NextResponse.json({ ok: false, message: "Форма ще не підключена. Налаштуйте PostgreSQL або Telegram." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
