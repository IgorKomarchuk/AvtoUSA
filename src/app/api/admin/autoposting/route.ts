import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { AutopostingService } from "@/lib/autoposting-service";
import { unknownTemplateVariables } from "@/lib/social-template";

const channel = z.enum(["TELEGRAM", "FACEBOOK", "INSTAGRAM", "VIBER"]);
const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mode"), mode: z.enum(["manual", "auto"]) }),
  z.object({ action: z.literal("filters"), minYear: z.number().int().min(1900).max(2100), maxPrice: z.number().int().positive().nullable(), allowedMakes: z.array(z.string().trim().min(1)).max(100), excludedMakes: z.array(z.string().trim().min(1)).max(100), allowedDamages: z.array(z.string().trim().min(1)).max(100), minPhotos: z.number().int().min(1).max(30) }),
  z.object({ action: z.literal("channel"), channel, enabled: z.boolean(), dailyLimit: z.number().int().min(0).max(20), timeWindows: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).max(12) }),
  z.object({ action: z.literal("template"), channel, body: z.string().min(10).max(4000) }),
  z.object({ action: z.literal("decision"), vehicleId: z.string().min(1), decision: z.enum(["APPROVED", "EXCLUDED", "PENDING"]) }),
  z.object({ action: z.literal("queue"), vehicleId: z.string().min(1), channels: z.array(channel).min(1).max(4), publishNow: z.boolean().default(false) }),
  z.object({ action: z.literal("publication"), publicationId: z.string().min(1), operation: z.enum(["cancel", "delete", "retry", "publish_now", "reschedule"]), scheduledAt: z.string().datetime().optional() }),
  z.object({ action: z.literal("process") }),
  z.object({ action: z.literal("find") }),
]);

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 422 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: false, message: "Спочатку налаштуйте PostgreSQL" }, { status: 503 });
  const service = new AutopostingService();
  const data = parsed.data;
  try {
    if (data.action === "mode") await prisma.siteSetting.upsert({ where: { key: "autopost_mode" }, create: { key: "autopost_mode", value: data.mode }, update: { value: data.mode } });
    if (data.action === "filters") {
      const { action: _action, ...filters } = data;
      void _action;
      await prisma.siteSetting.upsert({ where: { key: "autopost_filters" }, create: { key: "autopost_filters", value: filters }, update: { value: filters } });
    }
    if (data.action === "channel") await prisma.socialChannelSetting.upsert({ where: { channel: data.channel }, create: { channel: data.channel, enabled: data.enabled, dailyLimit: data.dailyLimit, timeWindows: data.timeWindows }, update: { enabled: data.enabled, dailyLimit: data.dailyLimit, timeWindows: data.timeWindows } });
    if (data.action === "template") {
      const unknown = unknownTemplateVariables(data.body);
      if (unknown.length) return NextResponse.json({ ok: false, message: `Невідомі змінні: ${unknown.join(", ")}` }, { status: 422 });
      await prisma.socialTemplate.upsert({ where: { channel: data.channel }, create: { channel: data.channel, body: data.body }, update: { body: data.body } });
    }
    if (data.action === "decision") await prisma.vehicle.update({ where: { id: data.vehicleId }, data: { publicationDecision: data.decision } });
    if (data.action === "queue") return NextResponse.json({ ok: true, result: await service.queueVehicle(data.vehicleId, data.channels, data.publishNow) });
    if (data.action === "publication") {
      const row = await prisma.socialPublication.findUnique({ where: { id: data.publicationId } });
      if (!row) return NextResponse.json({ ok: false, message: "Публікацію не знайдено" }, { status: 404 });
      if (data.operation === "delete") {
        if (!["QUEUED", "SCHEDULED", "FAILED", "CANCELLED"].includes(row.status)) return NextResponse.json({ ok: false, message: "Активну або опубліковану публікацію видаляти не можна" }, { status: 409 });
        await prisma.socialPublication.delete({ where: { id: row.id } });
        return NextResponse.json({ ok: true });
      }
      if (data.operation === "cancel") await prisma.socialPublication.update({ where: { id: row.id }, data: { status: "CANCELLED" } });
      if (data.operation === "retry" || data.operation === "publish_now") await prisma.socialPublication.update({ where: { id: row.id }, data: { status: "SCHEDULED", scheduledAt: new Date(), errorCode: null, errorMessage: null } });
      if (data.operation === "reschedule" && data.scheduledAt) await prisma.socialPublication.update({ where: { id: row.id }, data: { status: "SCHEDULED", scheduledAt: new Date(data.scheduledAt) } });
      if (data.operation === "publish_now") await service.processPublication(row.id);
    }
    if (data.action === "process") return NextResponse.json({ ok: true, result: await service.processQueue() });
    if (data.action === "find") return NextResponse.json({ ok: true, result: await service.enqueueCandidates() });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Помилка автопублікації" }, { status: 500 });
  }
}
