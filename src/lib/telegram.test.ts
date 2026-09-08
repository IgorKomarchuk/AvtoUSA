import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const getSocialCredentials = vi.fn();
vi.mock("./social-credentials", () => ({ getSocialCredentials }));

afterEach(() => {
  getSocialCredentials.mockReset();
  vi.unstubAllGlobals();
});

const lead = { name: "Тест", phone: "+380000000000", messenger: "Telegram", website: "" };

describe("lead Telegram delivery", () => {
  it("explains when the manager chat is not configured", async () => {
    getSocialCredentials.mockResolvedValue({ telegramBotToken: "token", telegramLeadChatId: "" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToTelegram } = await import("./telegram");
    await expect(sendLeadToTelegram(lead)).resolves.toEqual({ delivered: false, reason: "Chat ID менеджера для заявок не налаштовано" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a successful delivery only after Telegram confirms it", async () => {
    getSocialCredentials.mockResolvedValue({ telegramBotToken: "token", telegramLeadChatId: "-100123" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendLeadToTelegram } = await import("./telegram");
    await expect(sendLeadToTelegram(lead)).resolves.toEqual({ delivered: true });
  });

  it("surfaces the Telegram API description", async () => {
    getSocialCredentials.mockResolvedValue({ telegramBotToken: "token", telegramLeadChatId: "invalid" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, description: "Bad Request: chat not found" }), { status: 400 })));
    const { sendLeadToTelegram } = await import("./telegram");
    await expect(sendLeadToTelegram(lead)).rejects.toThrow("Bad Request: chat not found");
  });
});
