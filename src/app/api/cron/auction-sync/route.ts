import { NextRequest, NextResponse } from "next/server";
import { AuctionSyncService } from "@/lib/auction-sync-service";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ ok: false }, { status: 401 });
  if ((process.env.AUCTION_SYNC_MODE ?? "free") !== "free") return NextResponse.json({ ok: true, skipped: "Unsupported sync mode" });
  const service = new AuctionSyncService();
  const result = await service.syncVehicles();
  await service.cleanupExpiredLots();
  return NextResponse.json({ ok: result.status !== "FAILED", result }, { status: result.status === "FAILED" ? 502 : 200 });
}
