import type { Metadata } from "next";
import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";

export const revalidate = 1800;

export async function generateMetadata({ searchParams }: { searchParams: Promise<CatalogSearchParams> }): Promise<Metadata> {
  return catalogMetadata(undefined, "/cars", await searchParams);
}

export default async function CarsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  return <CatalogPage searchParams={await searchParams} />;
}
