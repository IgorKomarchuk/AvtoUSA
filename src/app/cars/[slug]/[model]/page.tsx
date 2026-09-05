import type { Metadata } from "next";
import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";

type Props = { params: Promise<{ slug: string; model: string }>; searchParams: Promise<CatalogSearchParams> };
const label = (value: string) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model } = await params;
  return catalogMetadata(`${label(slug)} ${label(model)}`);
}

export default async function MakeModelPage({ params, searchParams }: Props) {
  const { slug, model } = await params;
  const makeName = label(slug);
  const modelName = label(model);
  return <CatalogPage searchParams={await searchParams} preset={{ make: makeName, model: modelName }} heading={`${makeName} ${modelName} з аукціонів США`} />;
}
