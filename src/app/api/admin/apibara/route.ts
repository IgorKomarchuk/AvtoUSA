import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { ApibaraClient } from "@/lib/apibara";
import { activateApibaraKey, addApibaraKey, getApibaraKeyById, getApibaraKeySummary, removeApibaraKey } from "@/lib/apibara-credentials";

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  return NextResponse.json({ ok: true, keys: await getApibaraKeySummary() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { action?: string; id?: string; name?: string; key?: string };
  try {
    if (body.action === "add") await addApibaraKey(body.name ?? "", body.key ?? "");
    else if (body.action === "activate" && body.id) await activateApibaraKey(body.id);
    else if (body.action === "remove" && body.id) await removeApibaraKey(body.id);
    else if (body.action === "test" && body.id) {
      const usage = await new ApibaraClient(await getApibaraKeyById(body.id)).usage();
      return NextResponse.json({ ok: true, message: `Ключ працює. План: ${usage.plan ?? "—"}; залишилось: ${usage.remaining ?? "—"}.`, keys: await getApibaraKeySummary() });
    } else return NextResponse.json({ ok: false, message: "Некоректна дія" }, { status: 400 });
    return NextResponse.json({ ok: true, keys: await getApibaraKeySummary() });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Помилка налаштування" }, { status: 400 });
  }
}
