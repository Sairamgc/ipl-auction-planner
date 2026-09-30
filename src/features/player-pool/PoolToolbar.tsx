import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SORT_OPTIONS, type SortOption } from "@/domain";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";

import { PoolFilterForm } from "./PoolFilterForm";
import { activeFilterCount, type PoolSearch } from "./poolSearch";

/** Search is sent to the URL (and the API) 300 ms after typing stops (A8). */
export const SEARCH_DEBOUNCE_MS = 300;

interface PoolToolbarProps {
  search: PoolSearch;
  sort: SortOption;
  update: (change: Partial<PoolSearch>) => void;
  onClearAll: () => void;
  /** Filters open in a bottom sheet on mobile, a popover otherwise (UI26). */
  filtersIn: "popover" | "sheet";
  /** For the sheet's "Show N players" button. */
  total: number | null;
  className?: string;
}

export function PoolToolbar({
  search,
  sort,
  update,
  onClearAll,
  filtersIn,
  total,
  className,
}: PoolToolbarProps) {
  const id = useId();
  const count = activeFilterCount(search);
  const filtersLabel = count > 0 ? `Filters (${String(count)})` : "Filters";

  return (
    <div className={cn("flex flex-wrap items-end gap-2 px-4 py-3", className)}>
      <SearchField
        value={search.search ?? ""}
        onSearch={(value) => {
          update({ search: value || undefined });
        }}
      />

      <div className="flex flex-col gap-1">
        <Label htmlFor={`${id}-sort`} className="text-xs text-muted-foreground">
          Sort by
        </Label>
        <Select
          value={sort.id}
          onValueChange={(value) => {
            const option = SORT_OPTIONS.find(
              (candidate) => candidate.id === value,
            );
            if (option) update({ sort: option.sort, order: option.order });
          }}
        >
          <SelectTrigger id={`${id}-sort`} className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtersIn === "popover" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal aria-hidden="true" />
              {filtersLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            collisionPadding={16}
            aria-label="Filters"
            // Never taller than the space Radix finds on screen, so every
            // filter stays reachable
            className="max-h-[min(36rem,var(--radix-popover-content-available-height))] w-80 overflow-y-auto"
          >
            <PoolFilterForm search={search} update={update} />
            {count > 0 && (
              <Button variant="link" className="mt-3 px-0" onClick={onClearAll}>
                Clear all filters
              </Button>
            )}
          </PopoverContent>
        </Popover>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal aria-hidden="true" />
              {filtersLabel}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] gap-0">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Results update as you choose.</SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <PoolFilterForm search={search} update={update} />
            </div>
            <SheetFooter className="flex-row gap-2 border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
              {count > 0 && (
                <Button variant="outline" onClick={onClearAll}>
                  Clear all
                </Button>
              )}
              <SheetClose asChild>
                <Button className="flex-1">
                  {total === null
                    ? "Show players"
                    : `Show ${String(total)} ${total === 1 ? "player" : "players"}`}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

/**
 * Search input with its own state, sent on after the debounce. Follows the
 * URL when it changes elsewhere (e.g. "Clear all").
 */
function SearchField({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (value: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  const sent = useRef(value);
  // Always the latest callback, without restarting the debounce timer
  const send = useEffectEvent((next: string) => {
    sent.current = next;
    onSearch(next);
  });

  // Outside changes (chips, Clear all) win over the input's own text
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (text.trim() === sent.current) return;
    const timer = setTimeout(() => {
      send(text.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <div className="flex min-w-48 flex-1 flex-col gap-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        Search players
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="search"
          value={text}
          placeholder="Name"
          autoComplete="off"
          onChange={(event) => {
            setText(event.target.value);
          }}
          // Our own clear button replaces the browser's
          className="pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {text && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear search"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => {
              setText("");
            }}
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
