import { HomePage } from "@/components/home-page";
import { getVehicles } from "@/lib/vehicle-repository";

export const revalidate = 1800;

export default async function Page() {
  const catalog = await getVehicles({ limit: 12 });
  return <HomePage catalog={catalog} />;
}
