import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getIconUrl,
  getIconSvg,
  searchIcons,
  type IconifySearchResponse,
} from "./iconify.js";

describe("getIconUrl", () => {
  it("returns Iconify CDN URL for valid icon ID", () => {
    expect(getIconUrl("mdi:home")).toBe(
      "https://api.iconify.design/mdi/home.svg?height=24"
    );
    expect(getIconUrl("lucide:search")).toBe(
      "https://api.iconify.design/lucide/search.svg?height=24"
    );
  });

  it("uses custom size in query param", () => {
    expect(getIconUrl("mdi:home", 32)).toBe(
      "https://api.iconify.design/mdi/home.svg?height=32"
    );
    expect(getIconUrl("fa:user", 16)).toBe(
      "https://api.iconify.design/fa/user.svg?height=16"
    );
  });

  it("throws for invalid icon ID format", () => {
    expect(() => getIconUrl("")).toThrow('Invalid icon ID: "". Expected format "prefix:name".');
    expect(() => getIconUrl("no-colon")).toThrow(
      'Invalid icon ID: "no-colon". Expected format "prefix:name".'
    );
    expect(() => getIconUrl(":noname")).toThrow();
    expect(() => getIconUrl("noprefix:")).toThrow();
  });
});

describe("getIconSvg", () => {
  const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg">...</svg>';

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockSvg),
        } as Response)
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and returns SVG string for valid icon ID", async () => {
    const svg = await getIconSvg("mdi:home");
    expect(svg).toBe(mockSvg);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.iconify.design/mdi/home.svg?height=24"
    );
  });

  it("uses custom size when provided", async () => {
    await getIconSvg("mdi:home", 48);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.iconify.design/mdi/home.svg?height=48"
    );
  });

  it("throws when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 404 } as Response)
      )
    );
    await expect(getIconSvg("mdi:home")).rejects.toThrow(
      'Failed to fetch icon "mdi:home": 404'
    );
  });

  it("throws for invalid icon ID (getIconUrl throws)", async () => {
    await expect(getIconSvg("bad")).rejects.toThrow(
      'Invalid icon ID: "bad". Expected format "prefix:name".'
    );
  });
});

describe("searchIcons", () => {
  const mockResponse: IconifySearchResponse = {
    icons: ["mdi:home", "mdi:home-outline"],
    total: 2,
    limit: 64,
    start: 0,
    collections: {
      mdi: { name: "Material Design Icons", total: 7000 } as IconifySearchResponse["collections"][string],
    },
    request: { query: "home" },
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns search results from Iconify API", async () => {
    const result = await searchIcons("home");
    expect(result).toEqual(mockResponse);
    expect(result.icons).toContain("mdi:home");
    expect(result.total).toBe(2);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.iconify.design/search?query=home&limit=64"
    );
  });

  it("passes limit and start options", async () => {
    await searchIcons("home", { limit: 10, start: 20 });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.iconify.design/search?query=home&limit=10&start=20"
    );
  });

  it("uses empty query as space (API requirement)", async () => {
    await searchIcons(" ");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("query=+")
    );
  });

  it("throws when API returns non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 500 } as Response)
      )
    );
    await expect(searchIcons("home")).rejects.toThrow(
      "Iconify API error: 500"
    );
  });
});
