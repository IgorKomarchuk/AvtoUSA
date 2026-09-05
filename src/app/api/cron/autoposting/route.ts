import { NextRequest, NextResponse } from "next/server";
import { AutopostingService } from "@/lib/autoposting-service";

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ ok: false }, { status: 401 });
  const service = new AutopostingService();
  const job = request.nextUrl.searchParams.get("job") ?? "cycle";
  if (job === "candidates") return NextResponse.json({ ok: true, result: await service.enqueueCandidates() });
  if (job === "queue") return NextResponse.json({ ok: true, result: await service.processQueue() });
  if (job === "retry") return NextResponse.json({ ok: true, retried: await service.retryFailed() });
  if (job === "cleanup") return NextResponse.json({ ok: true, cleaned: await service.cleanupOldQueueItems() });
  const candidates = await service.enqueueCandidates();
  const queue = await service.processQueue();
  const retried = await service.retryFailed();
  const cleaned = await service.cleanupOldQueueItems();
  return NextResponse.json({ ok: true, candidates, queue, retried, cleaned });
}
