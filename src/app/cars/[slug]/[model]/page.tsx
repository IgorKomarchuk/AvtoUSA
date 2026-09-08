import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";
import { catalogSegment } from "@/lib/seo";
import { resolveCatalogTaxonomy } from "@/lib/vehicle-repository";

type Props = { params: Promise<{ slug: string; model: string }>; searchParams: Promise<CatalogSearchParams> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, model } = await params;
  const taxonomy = await resolveCatalogTaxonomy(slug, model);
  if (!taxonomy?.model) return {};
  return catalogMetadata(`${taxonomy.make} ${taxonomy.model}`, `/cars/${catalogSegment(taxonomy.make)}/${catalogSegment(taxonomy.model)}`, await searchParams);
}

export default async function MakeModelPage({ params, searchParams }: Props) {
  const { slug, model } = await params;
  const taxonomy = await resolveCatalogTaxonomy(slug, model);
  if (!taxonomy?.model) notFound();
  return <CatalogPage searchParams={await searchParams} preset={{ make: taxonomy.make, model: taxonomy.model }} heading={`${taxonomy.make} ${taxonomy.model} з аукціонів США`} />;
}
