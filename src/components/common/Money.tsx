import { formatLakh, formatLakhLabel } from "@/domain";
import { cn } from "@/lib/utils";

interface MoneyProps {
  lakh: number;
  className?: string;
}

/**
 * An amount in whole lakh, formatted for display (D12). Negatives show a
 * minus sign and are read as "minus …" by screen readers (D14).
 */
export function Money({ lakh, className }: MoneyProps) {
  return (
    // An amount never breaks across lines ("₹2.00 / Cr")
    <data value={String(lakh)} className={cn("whitespace-nowrap", className)}>
      {lakh < 0 ? (
        <>
          <span aria-hidden="true">{formatLakh(lakh)}</span>
          <span className="sr-only">{formatLakhLabel(lakh)}</span>
        </>
      ) : (
        formatLakh(lakh)
      )}
    </data>
  );
}
