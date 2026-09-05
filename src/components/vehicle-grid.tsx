import type { VehicleData } from "@/lib/types";
import { VehicleCard } from "./vehicle-card";
import type { SocialChannel } from "@prisma/client";

export function VehicleGrid({ vehicles, sourceChannel }: { vehicles: VehicleData[]; sourceChannel?: SocialChannel }) {
  if (!vehicles.length) return <div className="rounded-3xl border border-white/10 bg-white/[.035] p-10 text-center text-white/55">За вибраними параметрами автомобілів не знайдено.</div>;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vehicles.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} sourceChannel={sourceChannel} />)}</div>;
}
