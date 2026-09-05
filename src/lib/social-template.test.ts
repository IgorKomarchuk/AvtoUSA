import { afterEach, describe, expect, it, vi } from "vitest";
import { mockVehicles } from "./mock-data";
import { renderSocialTemplate, unknownTemplateVariables, vehicleSocialUrl } from "./social-template";
import { canQueuePublication, isChannelConfigured } from "./social-config";

afterEach(() => vi.unstubAllEnvs());

describe("social templates", () => {
  it("renders supported vehicle variables", () => {
    const text = renderSocialTemplate("{{year}} {{make}} {{model}} — {{currentBid}} — {{vehicleUrl}}", mockVehicles[0], "TELEGRAM");
    expect(text).toContain("2022 BMW X5");
    expect(text).not.toContain("{{");
    expect(text).toContain("utm_source=telegram");
  });

  it("uses channel-specific UTM parameters", () => {
    const url = vehicleSocialUrl(mockVehicles[0], "VIBER");
    expect(url).toContain("utm_source=viber");
    expect(url).toContain("utm_medium=messenger");
    expect(url).toContain("utm_campaign=auto_lots");
  });

  it("rejects unknown template variables", () => {
    expect(unknownTemplateVariables("{{year}} {{unknown}}")).toEqual(["unknown"]);
  });

  it("keeps optional channels disabled without credentials", () => {
    vi.stubEnv("FACEBOOK_PAGE_ID", "");
    vi.stubEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "");
    vi.stubEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "");
    vi.stubEnv("VIBER_BOT_TOKEN", "");
    vi.stubEnv("VIBER_BROADCAST_LIST", "");
    expect(isChannelConfigured("FACEBOOK")).toBe(false);
    expect(isChannelConfigured("INSTAGRAM")).toBe(false);
    expect(isChannelConfigured("VIBER")).toBe(false);
  });

  it("blocks duplicate publication after a successful post", () => {
    expect(canQueuePublication("PUBLISHED")).toBe(false);
    expect(canQueuePublication("FAILED")).toBe(true);
    expect(canQueuePublication(null)).toBe(true);
  });
});
