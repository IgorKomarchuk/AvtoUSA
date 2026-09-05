import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { AuctionSyncService } from "@/lib/auction-sync-service";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { provider?: string; action?: string };
  const service = new AuctionSyncService();
  try {
    if (body.action === "usage") return NextResponse.json({ ok: true, usage: await service.refreshUsage() });
    const result = body.provider === "copart" ? await service.syncCopart() : body.provider === "iaai" ? await service.syncIAAI() : await service.syncVehicles();
    return NextResponse.json({ ok: result.status !== "FAILED", result }, { status: result.status === "FAILED" ? 502 : 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Помилка операції" }, { status: 500 });
  }
}
