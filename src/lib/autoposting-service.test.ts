import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("autopost schedule", () => {
  let nextSchedule: typeof import("./autoposting-service").nextSchedule;

  beforeAll(async () => {
    ({ nextSchedule } = await import("./autoposting-service"));
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
});
