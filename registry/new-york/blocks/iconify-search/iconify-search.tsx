"use client";

import * as React from "react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { LoaderIcon } from "lucide-react";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxCollection,
} from "@/components/ui/combobox";
import { useIconifySearch } from "@/hooks/use-iconify-search";
import { getIconUrl } from "@/lib/iconify";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

export function IconifySearch(): React.ReactElement | null {
  const [query, setQuery] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  const [debouncedQuery, debouncer] = useDebouncedValue(
    query,
    { wait: DEBOUNCE_MS },
    (s) => ({
      isPending: s.isPending,
    })
  );
  const isDebouncing = debouncer.state.isPending ?? false;
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useIconifySearch(debouncedQuery);
  const isPending = isDebouncing || isLoading || isFetching;

  const icons = React.useMemo(() => {
    const merged = data?.pages.flatMap((page) => page.icons) ?? [];
    const deduped = [...new Set(merged)]; // dedupe: page 2 (limit=999) includes page 1's icons
    // Keep selected icon in the list so Base UI doesn't clear it when items change on close
    if (selectedIcon && !deduped.includes(selectedIcon)) {
      return [selectedIcon, ...deduped];
    }
    return deduped;
  }, [data, selectedIcon]);

  return (
    <div className="relative w-full min-w-[280px]">
      <Combobox
        items={icons}
        itemToStringValue={(iconId: string) => iconId}
        itemToStringLabel={(iconId: string) => iconId.split(":")[1] ?? iconId}
        filteredItems={icons}
        filter={null}
        value={selectedIcon}
        onValueChange={(value) => setSelectedIcon(value)}
        inputValue={query}
        onInputValueChange={(value, eventDetails) => {
          const reason = eventDetails?.reason;
          // Only update query (search term) when user is typing, not when selecting
          if (reason === "input-change") {
            setQuery(value);
          }
          if (reason === "input-clear" || reason === "clear-press") {
            setQuery("");
            setSelectedIcon(null);
          }
          if (!value.trim()) setSelectedIcon(null);
        }}
      >
        <ComboboxInput placeholder="Search icons..." showClear={!!query}>
          {selectedIcon && (
            <InputGroupAddon align="inline-start" className="pl-2">
              <img
                src={getIconUrl(selectedIcon, 20)}
                alt=""
                className="size-5"
                width={20}
                height={20}
              />
            </InputGroupAddon>
          )}
        </ComboboxInput>
        {isPending && (
          <div
            className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2"
            aria-hidden
          >
            <LoaderIcon className="text-muted-foreground size-4 animate-spin" />
          </div>
        )}
        <ComboboxContent>
          <ComboboxEmpty>
            {isPending
              ? "Searching..."
              : query.trim()
              ? "No icons found. Try a different search."
              : "Type to search icons from Iconify"}
          </ComboboxEmpty>
          <ComboboxList>
            <div className="grid grid-cols-6 gap-1 p-2 sm:grid-cols-8 empty:hidden">
              <ComboboxCollection>
                {(iconId: string) => (
                  <ComboboxItem
                    key={iconId}
                    value={iconId}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center p-0 [&>svg]:hidden"
                    )}
                  >
                    <img
                      src={getIconUrl(iconId, 24)}
                      alt={iconId.split(":")[1] ?? iconId}
                      className="size-6"
                      width={24}
                      height={24}
                    />
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </div>
            {hasNextPage && (
              <div className="flex justify-center py-3">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
