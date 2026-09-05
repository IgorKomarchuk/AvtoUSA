import { afterEach, describe, expect, it, vi } from "vitest";
import { mockVehicles } from "./mock-data";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("social publishers", () => {
  it("builds a Telegram photo post whose button points to the site", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_CHANNEL_ID", "@drive_state_test");
    vi.stubEnv("SITE_URL", "https://example.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 42, chat: { username: "drive_state_test" } } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { publishToSocialChannel } = await import("./social-publishers");
    const result = await publishToSocialChannel("TELEGRAM", mockVehicles[0], "Test post");
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { reply_markup: { inline_keyboard: Array<Array<{ url: string }>> } };
    expect(request.reply_markup.inline_keyboard[0][0].url).toContain("https://example.com/cars/");
    expect(request.reply_markup.inline_keyboard[0][0].url).toContain("utm_source=telegram");
    expect(result.externalPostUrl).toBe("https://t.me/drive_state_test/42");
  });

  it("fails one missing channel cleanly without making a request", async () => {
    vi.stubEnv("FACEBOOK_PAGE_ID", "");
    vi.stubEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { publishToSocialChannel } = await import("./social-publishers");
    await expect(publishToSocialChannel("FACEBOOK", mockVehicles[0], "Test post")).rejects.toMatchObject({ code: "NOT_CONFIGURED", retryable: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("waits for an Instagram container and stores its official permalink", async () => {
    vi.stubEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "123");
    vi.stubEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "test-token");
    vi.stubEnv("META_GRAPH_VERSION", "v99.0");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "container-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status_code: "FINISHED" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "media-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ permalink: "https://www.instagram.com/p/example/" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { publishToSocialChannel } = await import("./social-publishers");
    const result = await publishToSocialChannel("INSTAGRAM", mockVehicles[0], "Test post");
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(result).toEqual({ externalPostId: "media-1", externalPostUrl: "https://www.instagram.com/p/example/" });
  });
});
