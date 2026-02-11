"use client";

import { useQuery } from "@tanstack/react-query";
import {
  searchIcons,
  type IconifySearchResponse,
} from "./iconify.js";

const MAX_LIMIT = 999;

export function useIconifySearchAll(query: string) {
  return useQuery<IconifySearchResponse>({
    queryKey: ["iconify-search-all", query],
    queryFn: () => searchIcons(query, { limit: MAX_LIMIT }),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
