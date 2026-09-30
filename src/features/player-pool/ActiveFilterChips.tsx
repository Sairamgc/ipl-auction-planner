import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { filterChips, type PoolSearch } from "./poolSearch";

interface ActiveFilterChipsProps {
  search: PoolSearch;
  update: (change: Partial<PoolSearch>) => void;
  onClearAll: () => void;
}

/** The active search and filters, each removable, plus "Clear all" (UI26). */
export function ActiveFilterChips({
  search,
  update,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips = filterChips(search);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
      <ul aria-label="Active filters" className="contents">
        {chips.map((chip) => (
          <li key={chip.key}>
            <Button
              variant="secondary"
              size="xs"
              aria-label={`Remove filter: ${chip.label}`}
              onClick={() => {
                update(chip.remove);
              }}
            >
              {chip.label}
              <X aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="link" size="xs" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}
