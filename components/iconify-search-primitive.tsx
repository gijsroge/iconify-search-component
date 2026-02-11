"use client";

import * as React from "react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import {
  useIconifySearch,
  useIconifySearchAll,
} from "@/hooks/use-iconify-search";
import { getIconUrl } from "@/lib/iconify";
import type { IconifySearchResponse } from "@/lib/iconify";

const DEFAULT_DEBOUNCE_MS = 300;

export interface IconifySearchStateBase {
  /** Current raw query string */
  query: string;
  /** Update the search query */
  setQuery: (value: string) => void;
  /** Debounced query used for API calls */
  debouncedQuery: string;
  /** Whether the debouncer is still pending */
  isDebouncing: boolean;
  /** Raw search response from Iconify API */
  data: IconifySearchResponse | undefined;
  /** Whether the initial fetch is loading */
  isLoading: boolean;
  /** Whether a fetch is in progress (including refetch) */
  isFetching: boolean;
  /** Combined: debouncing or fetching */
  isPending: boolean;
  /** Currently selected icon ID (e.g. "mdi:home") */
  selectedIcon: string | null;
  /** Update the selected icon */
  setSelectedIcon: (iconId: string | null) => void;
  /** Helper to get Iconify CDN URL for an icon */
  getIconUrl: (iconId: string, size?: number) => string;
}

export interface IconifySearchStateAll extends IconifySearchStateBase {
  mode: "all";
  /** Icons grouped by collection prefix for display */
  groups: Array<{ prefix: string; name: string; icons: string[] }>;
}

export interface IconifySearchStatePaginated extends IconifySearchStateBase {
  mode: "paginated";
  /** Flat list of icon IDs for combobox-style UIs */
  icons: string[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export type IconifySearchState =
  | IconifySearchStateAll
  | IconifySearchStatePaginated;

export interface IconifySearchPrimitivePropsBase {
  /** Debounce delay in ms before triggering search */
  debounceMs?: number;
}

export interface IconifySearchPrimitivePropsAll
  extends IconifySearchPrimitivePropsBase {
  /** Fetches up to 999 icons at once (dialog) */
  mode?: "all";
  children: (state: IconifySearchStateAll) => React.ReactNode;
}

export interface IconifySearchPrimitivePropsPaginated
  extends IconifySearchPrimitivePropsBase {
  /** Loads 64 then "load more" (combobox) */
  mode: "paginated";
  children: (state: IconifySearchStatePaginated) => React.ReactNode;
}

export type IconifySearchPrimitiveProps =
  | IconifySearchPrimitivePropsAll
  | IconifySearchPrimitivePropsPaginated;

/**
 * Renderless component that interfaces with the Iconify API for icon search.
 * Provides search state, grouping, selection, and URL helpers via render props.
 * Use this to build custom UI (dialogs, comboboxes, etc.) without duplicating logic.
 */
export function IconifySearchPrimitive({
  mode = "all",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  children,
}: IconifySearchPrimitiveProps): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);

  const [debouncedQuery, debouncer] = useDebouncedValue(
    query,
    { wait: debounceMs },
    (s) => ({ isPending: s.isPending })
  );
  const isDebouncing = debouncer.state.isPending ?? false;

  const allQuery = useIconifySearchAll(debouncedQuery);
  const paginatedQuery = useIconifySearch(debouncedQuery);

  const allData = allQuery.data;
  const paginatedData = paginatedQuery.data;
  const { isLoading, isFetching } =
    mode === "all" ? allQuery : paginatedQuery;
  const isPending = isDebouncing || isLoading || isFetching;
  const data = mode === "all" ? allData : undefined;

  const groups = React.useMemo(() => {
    if (mode === "paginated") return [];
    const icons = data?.icons ?? [];
    const deduped = [...new Set(icons)];
    const allCollections: Record<string, { name: string }> = {};
    if (data?.collections) {
      Object.entries(data.collections).forEach(([prefix, info]) => {
        allCollections[prefix] = { name: info.name ?? prefix };
      });
    }
    if (selectedIcon && !deduped.includes(selectedIcon)) {
      deduped.unshift(selectedIcon);
      const [prefix] = selectedIcon.split(":");
      if (prefix && !allCollections[prefix]) {
        allCollections[prefix] = { name: prefix };
      }
    }
    const byPrefix = new Map<string, string[]>();
    for (const iconId of deduped) {
      const prefix = iconId.split(":")[0] ?? "other";
      if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
      byPrefix.get(prefix)!.push(iconId);
    }
    return Array.from(byPrefix.entries()).map(([prefix, icons]) => ({
      prefix,
      name: allCollections[prefix]?.name ?? prefix,
      icons,
    }));
  }, [data, selectedIcon, mode]);

  const icons = React.useMemo(() => {
    if (mode === "all") return [];
    const merged = paginatedData?.pages?.flatMap((page) => page.icons) ?? [];
    const deduped = [...new Set(merged)];
    if (selectedIcon && !deduped.includes(selectedIcon)) {
      return [selectedIcon, ...deduped];
    }
    return deduped;
  }, [paginatedData, selectedIcon, mode]);

  const baseState: IconifySearchStateBase = {
    query,
    setQuery,
    debouncedQuery,
    isDebouncing,
    data: mode === "all" ? data : undefined,
    isLoading,
    isFetching,
    isPending,
    selectedIcon,
    setSelectedIcon,
    getIconUrl,
  };

  const state: IconifySearchState =
    mode === "all"
      ? { ...baseState, mode: "all", groups }
      : {
          ...baseState,
          mode: "paginated",
          icons,
          fetchNextPage: paginatedQuery.fetchNextPage,
          hasNextPage: paginatedQuery.hasNextPage ?? false,
          isFetchingNextPage: paginatedQuery.isFetchingNextPage ?? false,
        };

  return (
    <>
      {(children as (state: IconifySearchState) => React.ReactNode)(state)}
    </>
  );
}
