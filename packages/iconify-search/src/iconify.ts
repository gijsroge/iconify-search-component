import type { IconifyInfo } from "@iconify/types";

const ICONIFY_API = "https://api.iconify.design";

export interface IconifySearchResponse {
  icons: string[];
  total: number;
  limit: number;
  start: number;
  collections: Record<string, IconifyInfo>;
  request: Record<string, string>;
}

export async function searchIcons(
  query: string,
  options?: { limit?: number; start?: number }
): Promise<IconifySearchResponse> {
  const params = new URLSearchParams({
    query: query.trim() || " ",
    limit: String(options?.limit ?? 64),
    ...(options?.start != null && { start: String(options.start) }),
  });

  const response = await fetch(`${ICONIFY_API}/search?${params}`);

  if (!response.ok) {
    throw new Error(`Iconify API error: ${response.status}`);
  }

  return response.json();
}

export function getIconUrl(iconId: string, size = 24): string {
  const [prefix, name] = iconId.split(":");
  if (!prefix || !name) {
    throw new Error(
      `Invalid icon ID: "${iconId}". Expected format "prefix:name".`
    );
  }
  return `https://api.iconify.design/${prefix}/${name}.svg?height=${size}`;
}

/**
 * Fetches the SVG markup for an icon by its ID (e.g. "mdi:home").
 * Returns the raw SVG string, or throws on invalid ID or network error.
 */
export async function getIconSvg(iconId: string, size = 24): Promise<string> {
  const url = getIconUrl(iconId, size);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch icon "${iconId}": ${response.status}`);
  }
  return response.text();
}
