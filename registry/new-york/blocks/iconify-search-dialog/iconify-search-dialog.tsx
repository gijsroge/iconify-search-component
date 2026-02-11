"use client";

import * as React from "react";
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
import { IconifySearchPrimitive } from "@/components/iconify-search-primitive";
import { cn } from "@/lib/utils";

export interface IconifySearchDialogProps {
  /** Allow selecting multiple icons */
  multiple?: boolean;
}

export function IconifySearchDialog({
  multiple = false,
}: IconifySearchDialogProps): React.ReactElement | null {
  const [open, setOpen] = React.useState(false);

  return (
    <IconifySearchPrimitive debounceMs={300} multiple={multiple}>
      {(state) => (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {state.selectedIcons.length > 0 ? (
                <span className="flex items-center gap-2">
                  {state.selectedIcons.slice(0, 3).map((iconId) => (
                    <img
                      key={iconId}
                      src={state.getIconUrl(iconId, 18)}
                      alt=""
                      className="size-4"
                      width={18}
                      height={18}
                    />
                  ))}
                  {state.selectedIcons.length > 3 && (
                    <span className="text-muted-foreground text-xs">
                      +{state.selectedIcons.length - 3}
                    </span>
                  )}
                  {!state.multiple && state.selectedIcons[0] && (
                    <span>
                      {state.selectedIcons[0].split(":")[1] ??
                        state.selectedIcons[0]}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SearchIcon className="size-4" />
                  {state.multiple ? "Pick icons" : "Pick icon"}
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
                  value={state.query}
                  onChange={(e) => state.setQuery(e.target.value)}
                  className="pr-9"
                />
                {state.isPending && (
                  <LoaderIcon
                    className="text-muted-foreground absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin"
                    aria-hidden
                  />
                )}
              </div>
              <div className="scroll-fade-y min-h-0 flex-1">
                {!state.debouncedQuery.trim() ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Type to search icons from Iconify
                  </p>
                ) : state.isPending && !state.data ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Searching...
                  </p>
                ) : state.groups.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No icons found. Try a different search.
                  </p>
                ) : (
                  <div className="flex flex-col gap-6 pb-4">
                    {state.groups.map(({ prefix, name, icons }) => (
                      <div key={prefix} className="flex flex-col gap-2">
                        <h3 className="text-muted-foreground sticky top-0 bg-background/95 px-2 py-1 text-xs font-medium backdrop-blur sm:px-0">
                          {name}
                        </h3>
                        <div className="grid grid-cols-6 gap-1 sm:grid-cols-8">
                          {icons.map((iconId) => {
                            const isSelected =
                              state.selectedIcons.includes(iconId);
                            return (
                              <button
                                key={iconId}
                                type="button"
                                onClick={() => {
                                  state.selectIcon(iconId);
                                  if (!state.multiple) setOpen(false);
                                }}
                                className={cn(
                                  "flex size-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent",
                                  isSelected && "bg-accent"
                                )}
                              >
                                <img
                                  src={state.getIconUrl(iconId, 24)}
                                  alt={iconId.split(":")[1] ?? iconId}
                                  className="size-6"
                                  width={24}
                                  height={24}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {state.multiple && state.selectedIcons.length > 0 && (
              <div className="flex items-center justify-between gap-4 pt-2 border-t -mx-6 px-6">
                <div className="relative min-w-0 flex-1 overflow-hidden">
                  <div
                    className="flex gap-1 overflow-x-auto pb-1 scrollbar-width:none [&::-webkit-scrollbar]:hidden"
                    style={{
                      maskImage:
                        "linear-gradient(to right, black 70%, transparent 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to right, black 70%, transparent 100%)",
                    }}
                  >
                    {state.selectedIcons.map((iconId) => (
                      <img
                        key={iconId}
                        src={state.getIconUrl(iconId, 24)}
                        alt={iconId.split(":")[1] ?? iconId}
                        className="size-6 shrink-0 rounded"
                        width={16}
                        height={16}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => state.setSelectedIcons([])}
                >
                  Clear all
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </IconifySearchPrimitive>
  );
}
