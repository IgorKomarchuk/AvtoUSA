import { describe, expect, it } from "vitest";
import { auctionTargets, matchesAuctionSelection } from "./auction-selection";
const car = { platform: "COPART", year: 2020, make: "Toyota", model: "RAV4", odometerMiles: 40000, primaryDamage: "Front end" };
describe("auction selection", () => {
  it("accepts configured families", () => {
    for (const [make, model] of auctionTargets) expect(matchesAuctionSelection({ ...car, make, model: make === "BMW" && model !== "X5" ? `${model} Series` : model })).toBe(true);
  });
  it("accepts inclusive boundaries", () => {
    for (const year of [2014, 2025]) for (const odometerMiles of [1000, 80000]) expect(matchesAuctionSelection({ ...car, year, odometerMiles, primaryDamage: "NORMAL WEAR" })).toBe(true);
  });
  it("rejects unknown or outside criteria", () => {
    for (const change of [{ odometerMiles: null }, { odometerMiles: 999 }, { odometerMiles: 80001 }, { year: 2013 }, { year: 2026 }, { primaryDamage: "Rear end" }, { primaryDamage: null }, { platform: "IAAI" }, { make: "Jeep", model: "Grand Cherokee" }]) expect(matchesAuctionSelection({ ...car, ...change })).toBe(false);
  });
  it("supports BMW aliases", () => {
    for (const model of ["330i", "530i", "G20", "F30", "G30", "G60"]) expect(matchesAuctionSelection({ ...car, make: "BMW", model })).toBe(true);
    expect(matchesAuctionSelection({ ...car, make: "BMW", model: "X3" })).toBe(false);
  });
});
