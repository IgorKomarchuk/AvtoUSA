import { CatalogPage, catalogMetadata, type CatalogSearchParams } from "@/components/catalog-page";

export const metadata = catalogMetadata();
export const revalidate = 1800;

export default async function CarsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  return <CatalogPage searchParams={await searchParams} />;
}
