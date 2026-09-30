import { Input } from "@/components/ui/input";
import { formatLakh, validateExpectedPrice } from "@/domain";
import { useId, useState } from "react";

/** Arrow keys change the price by this many lakh (UI36). */
const STEP_LAKH = 5;

interface PriceInputProps {
  playerName: string;
  savedLakh: number;
  basePriceLakh: number;
  onSave: (lakh: number) => void;
}

/**
 * A target's expected price, always editable (UI39): Enter or blur saves a
 * valid changed value, an invalid one shows its error and is not saved
 * (A5), Escape puts back the saved price.
 */
export function PriceInput({
  playerName,
  savedLakh,
  basePriceLakh,
  onSave,
}: PriceInputProps) {
  const id = useId();
  // What the user is typing, or null to show the saved price. Showing the
  // saved price directly (not a copy) means a rollback always appears
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const text = draft ?? String(savedLakh);

  const commit = () => {
    if (draft === null) return;
    const result = validateExpectedPrice(draft, basePriceLakh);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDraft(null);
    if (result.lakh !== savedLakh) onSave(result.lakh);
  };

  const preview = validateExpectedPrice(text, 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          value={text}
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Expected price for ${playerName}, in lakh`}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-preview${error ? ` ${id}-error` : ""}`}
          className="h-8 w-24"
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              setDraft(null);
              setError(null);
            } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              const current = validateExpectedPrice(text, 0);
              const from = current.ok ? current.lakh : savedLakh;
              const next =
                event.key === "ArrowUp"
                  ? from + STEP_LAKH
                  : Math.max(0, from - STEP_LAKH);
              setDraft(String(next));
            }
          }}
        />
        <span
          id={`${id}-preview`}
          className="w-20 text-xs text-muted-foreground"
        >
          {preview.ok ? formatLakh(preview.lakh) : ""}
        </span>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="max-w-56 text-xs text-destructive-subtle-foreground"
        >
          {error}
        </p>
      )}
    </div>
  );
}
