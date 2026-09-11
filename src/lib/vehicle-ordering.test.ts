import { describe, expect, it } from "vitest";
import { interleaveVehiclesByMake } from "./vehicle-ordering";

describe("interleaveVehiclesByMake", () => {
  it("does not allow one make to occupy the first page", () => {
    const vehicles = [
      { id: "vw-1", make: "Volkswagen" }, { id: "vw-2", make: "Volkswagen" },
      { id: "vw-3", make: "Volkswagen" }, { id: "ford-1", make: "Ford" },
      { id: "bmw-1", make: "BMW" }, { id: "ford-2", make: "Ford" },
    ];
    expect(interleaveVehiclesByMake(vehicles).map((vehicle) => vehicle.id)).toEqual([
      "vw-1", "ford-1", "bmw-1", "vw-2", "ford-2", "vw-3",
    ]);
  });

  it("keeps the relative auction order inside each make", () => {
    const vehicles = [{ id: 1, make: "Kia" }, { id: 2, make: "Kia" }, { id: 3, make: "Toyota" }];
    expect(interleaveVehiclesByMake(vehicles).map((vehicle) => vehicle.id)).toEqual([1, 3, 2]);
  });
});
