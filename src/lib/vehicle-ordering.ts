/**
 * Round-robin vehicles by make while preserving the order inside every make.
 * Auction feeds often return many lots for one popular model; without this
 * step those lots can occupy the whole first page even when other makes exist.
 */
export function interleaveVehiclesByMake<T extends { make?: string | null }>(vehicles: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const vehicle of vehicles) {
    const key = vehicle.make?.trim().toUpperCase() || "OTHER";
    const group = groups.get(key) ?? [];
    group.push(vehicle);
    groups.set(key, group);
  }

  const result: T[] = [];
  let offset = 0;
  while (result.length < vehicles.length) {
    for (const group of groups.values()) {
      if (group[offset]) result.push(group[offset]);
    }
    offset += 1;
  }
  return result;
}
