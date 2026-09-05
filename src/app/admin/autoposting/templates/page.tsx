import { AdminShell } from "@/components/admin-shell";
import { TemplateEditor } from "@/components/autopost-controls";
import { requireAdmin } from "@/lib/auth";
import { getAutopostTemplates } from "@/lib/autopost-admin-data";

export const dynamic="force-dynamic";
export const metadata={title:"Шаблони автопублікацій",robots:{index:false,follow:false}};
export default async function TemplatesPage(){await requireAdmin();const templates=await getAutopostTemplates();return <AdminShell title="Шаблони постів" description="Доступні змінні: {{year}}, {{make}}, {{model}}, {{trim}}, {{auction}}, {{currentBid}}, {{buyNowPrice}}, {{odometer}}, {{primaryDamage}}, {{auctionDate}}, {{vehicleUrl}}."><div className="grid gap-5 lg:grid-cols-2">{templates.map(template=><TemplateEditor key={template.channel} channel={template.channel} body={template.body}/>)}</div></AdminShell>}
