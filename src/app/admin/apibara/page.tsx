import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { ApibaraKeyManager } from "@/components/apibara-key-manager";
import { requireAdmin } from "@/lib/auth";
import { getApibaraKeySummary } from "@/lib/apibara-credentials";

export const metadata: Metadata = { title: "API аукціонів", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminApibaraPage() {
  await requireAdmin();
  return <AdminShell title="API аукціонів" description="Керування ключами Apibara для синхронізації реальних лотів Copart та IAAI."><ApibaraKeyManager initialKeys={await getApibaraKeySummary()}/></AdminShell>;
}
