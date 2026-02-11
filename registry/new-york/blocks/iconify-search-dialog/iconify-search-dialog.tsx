"use client";

import * as React from "react";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { LoaderIcon, SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIconifySearchAll } from "@/hooks/use-iconify-search";
import { getIconUrl } from "@/lib/iconify";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;

export function IconifySearchDialog(): React.ReactElement | null {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  const [debouncedQuery, debouncer] = useDebouncedValue(
    query,
    { wait: DEBOUNCE_MS },
    (s) => ({ isPending: s.isPending })
  );
  const isDebouncing = debouncer.state.isPending ?? false;
  const { data, isLoading, isFetching } = useIconifySearchAll(debouncedQuery);

  const isPending = isDebouncing || isLoading || isFetching;

  const groups = React.useMemo(() => {
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
  }, [data, selectedIcon]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {selectedIcon ? (
            <span className="flex items-center gap-2">
              <img
                src={getIconUrl(selectedIcon, 18)}
                alt=""
                className="size-4"
                width={18}
                height={18}
              />
              {selectedIcon.split(":")[1] ?? selectedIcon}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SearchIcon className="size-4" />
              Pick icon
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[520px] flex-col gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Search icons</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="relative shrink-0">
            <Input
              placeholder="Search icons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-9"
            />
            {isPending && (
              <LoaderIcon
                className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin"
                aria-hidden
              />
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!debouncedQuery.trim() ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Type to search icons from Iconify
              </p>
            ) : isPending && !data ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Searching...
              </p>
            ) : groups.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No icons found. Try a different search.
              </p>
            ) : (
              <div className="flex flex-col gap-6 pb-4">
                {groups.map(({ prefix, name, icons }) => (
                  <div key={prefix} className="flex flex-col gap-2">
                    <h3 className="text-muted-foreground sticky top-0 bg-background/95 px-2 py-1 text-xs font-medium backdrop-blur sm:px-0">
                      {name}
                    </h3>
                    <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
                      {icons.map((iconId) => (
                        <button
                          key={iconId}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(iconId);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent",
                            selectedIcon === iconId && "bg-accent"
                          )}
                        >
                          <img
                            src={getIconUrl(iconId, 24)}
                            alt={iconId.split(":")[1] ?? iconId}
                            className="size-6"
                            width={24}
                            height={24}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
