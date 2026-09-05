import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { allowRequest } from "@/lib/rate-limit";
import { authenticateAdmin, createAdminSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`admin-login:${ip}`, 8, 15 * 60_000)) return NextResponse.json({ ok: false, message: "Забагато спроб входу." }, { status: 429 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Перевірте email і пароль." }, { status: 422 });
  const user = await authenticateAdmin(parsed.data.email, parsed.data.password).catch(() => null);
  if (!user) return NextResponse.json({ ok: false, message: "Невірний email або пароль." }, { status: 401 });
  const token = await createAdminSession(user);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  return NextResponse.json({ ok: true });
}
