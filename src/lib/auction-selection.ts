/** Business selection shared by imports and regression tests. No provider calls here. */
export const auctionTargets = [
  // Keep the first pass diverse. With one request per FREE-mode sync, grouping
  // models by make would fill the catalog with one brand for several days.
  ["Volkswagen", "Jetta"], ["Hyundai", "Elantra"], ["Ford", "Fusion"],
  ["Mazda", "3"], ["Nissan", "Rogue"], ["Kia", "Sportage"],
  ["Jeep", "Cherokee"], ["Toyota", "RAV4"], ["Honda", "CR-V"],
  ["Subaru", "Forester"], ["Tesla", "Model 3"], ["BMW", "X5"],
  ["Volkswagen", "Passat"], ["Hyundai", "Tucson"], ["Ford", "Escape"],
  ["Mazda", "CX-5"], ["Kia", "Forte"], ["Subaru", "Outback"],
  ["BMW", "3"], ["BMW", "5"], ["Volkswagen", "Tiguan"],
] as const;

type SelectionVehicle = {
  platform: string; year?: number | null; make?: string | null; model?: string | null;
  odometerMiles?: number | null; primaryDamage?: string | null;
};
const normalize = (value: string | null | undefined) => (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function matchesAuctionSelection(vehicle: SelectionVehicle): boolean {
  if (vehicle.platform !== "COPART" || vehicle.year == null || vehicle.year < 2014 || vehicle.year > 2025
    || vehicle.odometerMiles == null || vehicle.odometerMiles < 1000 || vehicle.odometerMiles > 80000
    || !["frontend", "normalwear", "normalwearandtear"].includes(normalize(vehicle.primaryDamage))) return false;
  const make = normalize(vehicle.make);
  const model = normalize(vehicle.model);
  return auctionTargets.some(([brand, target]) => {
    if (make !== normalize(brand)) return false;
    if (brand === "BMW" && target !== "X5") {
      // Chassis is not reliably supplied. Match the requested sedan families, not GT/touring.
      return model === `${target}series` || new RegExp(`^${target}[0-9]{2}(i|d|e)?(xdrive)?$`).test(model)
        || (target === "3" ? ["f30", "g20"] : ["g30", "g60"]).includes(model);
    }
    return model === normalize(target) || (brand === "Mazda" && target === "3" && model === "mazda3");
  });
}
