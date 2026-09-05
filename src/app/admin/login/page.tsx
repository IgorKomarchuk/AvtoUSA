import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Вхід до панелі керування", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <main className="shell grid min-h-screen place-items-center py-10"><section className="glass w-full max-w-md rounded-[30px] p-7 sm:p-9"><Link href="/" className="text-xl font-black tracking-[-.04em] no-underline">DRIVE<span className="text-[#ff6b00]">STATE</span></Link><p className="mt-8 text-xs font-black uppercase tracking-[.14em] text-[#ff7b1a]">Захищена зона</p><h1 className="mt-2 text-4xl font-bold tracking-[-.05em]">Вхід до адмінпанелі</h1><p className="mt-3 text-sm leading-6 text-white/45">У production використовується користувач із PostgreSQL. Для локального DEMO-режиму можна використати ADMIN_INITIAL_EMAIL і ADMIN_INITIAL_PASSWORD з `.env`.</p><AdminLoginForm /></section></main>;
}
