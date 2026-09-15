import { describe, expect, it } from "vitest";
import { trustedClientIp } from "./client-ip";

describe("trustedClientIp", () => {
  it("prefers the address supplied by the trusted reverse proxy", () => {
    const headers = new Headers({
      "x-real-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.77, 203.0.113.10",
    });
    expect(trustedClientIp(headers)).toBe("203.0.113.10");
  });

  it("does not trust the first client-controlled forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.77, 203.0.113.10" });
    expect(trustedClientIp(headers)).toBe("203.0.113.10");
  });
});
