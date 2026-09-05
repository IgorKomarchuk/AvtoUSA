import { beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  update: vi.fn().mockResolvedValue({}),
  createError: vi.fn().mockResolvedValue({}),
  publish: vi.fn().mockRejectedValue(new Error("social network unavailable")),
  publication: {
    id: "publication-1", vehicleId: "vehicle-1", channel: "FACEBOOK", status: "SCHEDULED", retryCount: 0,
    vehicle: { id: "vehicle-1", slug: "2021-bmw-x5-copart-123", lotNumber: "123", platform: "COPART", title: "2021 BMW X5", year: 2021, make: "BMW", model: "X5", isDemo: false, isActive: true, lastSyncedAt: new Date("2026-09-05T00:00:00Z"), photos: [{ url: "https://example.com/car.jpg", position: 0 }] },
  },
}));

vi.mock("./prisma", () => ({
  getPrisma: () => ({
    socialPublication: {
      findUnique: vi.fn().mockResolvedValue(mocks.publication),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: mocks.update,
    },
    socialPublicationError: { create: mocks.createError },
    socialTemplate: { findUnique: vi.fn().mockResolvedValue(null) },
    $transaction: (operations: Array<Promise<unknown>>) => Promise.all(operations),
  }),
}));

vi.mock("./social-publishers", () => ({
  SocialPublishError: class SocialPublishError extends Error {
    constructor(message: string, public readonly code: string, public readonly retryable = true) { super(message); }
  },
  publishToSocialChannel: mocks.publish,
}));

describe("social failure isolation", () => {
  let AutopostingService: typeof import("./autoposting-service").AutopostingService;

  beforeAll(async () => {
    vi.stubEnv("FACEBOOK_PAGE_ID", "page-1");
    vi.stubEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "token");
    ({ AutopostingService } = await import("./autoposting-service"));
  });

  it("records a failed publication and returns without crashing the worker", async () => {
    const result = await new AutopostingService().processPublication("publication-1");
    expect(result).toBe("failed");
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "FAILED", retryCount: 1 }) }));
    expect(mocks.createError).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ channel: "FACEBOOK", retryCount: 1 }) }));
  });
});
