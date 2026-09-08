import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { SITE_CONTACTS_KEY } from "@/lib/site-contacts";

const schema = z.object({
  phoneDisplay: z.string().trim().min(7).max(40),
  phoneHref: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Телефон для дзвінка має містити лише цифри та необов’язковий +"),
  email: z.string().trim().email(),
  telegramUrl: z.string().trim().url().refine((value) => new URL(value).protocol === "https:", "Потрібне HTTPS-посилання"),
  instagramUrl: z.string().trim().url().refine((value) => new URL(value).protocol === "https:", "Потрібне HTTPS-посилання"),
});

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ ok: false, message: "Потрібна авторизація" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message ?? "Перевірте контакти" }, { status: 422 });
  const prisma = getPrisma();
  if (!prisma) return NextResponse.json({ ok: false, message: "PostgreSQL не підключено" }, { status: 503 });
  await prisma.siteSetting.upsert({ where: { key: SITE_CONTACTS_KEY }, create: { key: SITE_CONTACTS_KEY, value: parsed.data }, update: { value: parsed.data } });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
