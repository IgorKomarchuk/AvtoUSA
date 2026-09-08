import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { defaultSiteContacts, normalizeSiteContacts } from "./site-contacts";

describe("site contacts", () => {
  it("uses production defaults when settings are absent", () => {
    expect(normalizeSiteContacts(null)).toEqual(defaultSiteContacts);
  });

  it("normalizes saved contact values", () => {
    expect(normalizeSiteContacts({ ...defaultSiteContacts, phoneDisplay: "  +380 73 000 00 00  ", email: "new@example.com" })).toMatchObject({ phoneDisplay: "+380 73 000 00 00", email: "new@example.com" });
  });
});
