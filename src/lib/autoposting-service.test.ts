import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("autopost schedule", () => {
  let nextSchedule: typeof import("./autoposting-service").nextSchedule;
  let diversifyCandidatesByMake: typeof import("./autoposting-service").diversifyCandidatesByMake;

  beforeAll(async () => {
    ({ nextSchedule, diversifyCandidatesByMake } = await import("./autoposting-service"));
  });

  it("assigns different configured windows instead of batching posts", () => {
    const now = new Date("2026-09-05T05:00:00.000Z");
    const first = nextSchedule(["09:00", "12:00", "15:00"], 0, now, "Europe/Kyiv");
    const second = nextSchedule(["09:00", "12:00", "15:00"], 1, now, "Europe/Kyiv");
    expect(first.toISOString()).toBe("2026-09-05T06:00:00.000Z");
    expect(second.toISOString()).toBe("2026-09-05T09:00:00.000Z");
  });

  it("uses spaced fallback slots when no valid window exists", () => {
    const now = new Date("2026-09-05T05:00:00.000Z");
    expect(nextSchedule([], 1, now).getTime() - now.getTime()).toBe(30 * 60_000);
  });

  it("rotates makes before selecting another vehicle from the same make", () => {
    const candidates = [
      { vehicle: { make: "Volkswagen", title: "Passat 1" } },
      { vehicle: { make: "Volkswagen", title: "Passat 2" } },
      { vehicle: { make: "BMW", title: "X5" } },
      { vehicle: { make: "Tesla", title: "Model 3" } },
      { vehicle: { make: "BMW", title: "G30" } },
    ];

    expect(diversifyCandidatesByMake(candidates).map((item) => item.vehicle.title)).toEqual([
      "Passat 1",
      "X5",
      "Model 3",
      "Passat 2",
      "G30",
    ]);
  });
});
