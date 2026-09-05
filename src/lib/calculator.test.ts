import { describe, expect, it } from "vitest";
import { calculateTurnkey, calculatorDefaults } from "./calculator";

describe("calculateTurnkey", () => {
  it("adds all cost components", () => {
    expect(calculateTurnkey(calculatorDefaults)).toBe(26_250);
  });

  it("does not allow negative components to reduce the quote", () => {
    expect(calculateTurnkey({ ...calculatorDefaults, repair: -500 })).toBe(22_750);
  });
});
