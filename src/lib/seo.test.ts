import { describe, expect, it } from "vitest";
import { catalogName, catalogRobotsAndCanonical, catalogSegment, jsonLd } from "./seo";

describe("SEO helpers", () => {
  it("creates stable catalog slugs", () => {
    expect(catalogSegment("Mercedes-Benz")).toBe("mercedes-benz");
    expect(catalogSegment("F-150 Lightning")).toBe("f-150-lightning");
    expect(catalogName("bmw")).toBe("BMW");
  });

  it("self-canonicalizes clean pagination but noindexes filtered catalogs", () => {
    expect(catalogRobotsAndCanonical("/cars", { page: "2" })).toEqual({ canonical: "/cars?page=2", robots: undefined, page: 2 });
    expect(catalogRobotsAndCanonical("/cars", { make: "BMW", page: "2" })).toMatchObject({ canonical: "/cars", robots: { index: false, follow: true }, page: null });
  });

  it("ignores campaign parameters and safely serializes JSON-LD", () => {
    expect(catalogRobotsAndCanonical("/cars", { utm_source: "google" }).robots).toBeUndefined();
    expect(jsonLd({ value: "<script>" })).not.toContain("<script>");
  });
});
