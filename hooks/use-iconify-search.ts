"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
  searchIcons,
  type IconifySearchResponse,
} from "@/lib/iconify"

const PAGE_SIZE = 64
const MAX_LIMIT = 999

export function useIconifySearch(query: string) {
  return useInfiniteQuery<IconifySearchResponse>({
    queryKey: ["iconify-search", query],
    queryFn: ({ pageParam }) =>
      searchIcons(query, {
        limit: pageParam === 0 ? PAGE_SIZE : MAX_LIMIT,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length > 1) return undefined
      if (lastPage.icons.length < lastPage.limit) return undefined
      return 1 // load more: fetch with limit=999
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

export function useIconifySearchAll(query: string) {
  return useQuery<IconifySearchResponse>({
    queryKey: ["iconify-search-all", query],
    queryFn: () => searchIcons(query, { limit: MAX_LIMIT }),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
