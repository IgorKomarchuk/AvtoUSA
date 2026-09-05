import { describe, expect, it } from "vitest";
import { mockVehicles } from "./mock-data";
import { publicationQuality } from "./publication-quality";

describe("publicationQuality", () => {
  it("never allows demo inventory", () => {
    const result = publicationQuality(mockVehicles[0]);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toContain("DEMO-лот");
  });

  it("accepts a complete active real lot", () => {
    const vehicle = { ...mockVehicles[0], isDemo: false, auctionDate: new Date(Date.now() + 86_400_000) };
    expect(publicationQuality(vehicle).eligible).toBe(true);
  });

  it("rejects incomplete and expired lots", () => {
    const vehicle = { ...mockVehicles[0], isDemo: false, currentBid: null, buyNowPrice: null, primaryDamage: null, auctionDate: new Date(Date.now() - 3 * 86_400_000) };
    const result = publicationQuality(vehicle);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining(["немає ціни або ставки", "немає пошкодження", "лот прострочений"]));
  });
});
