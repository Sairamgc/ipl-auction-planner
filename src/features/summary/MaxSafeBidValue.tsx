import { Money } from "@/components/common/Money";
import type { MaxSafeBidView } from "@/domain";

/** The figure, or "—" read as "not applicable" when the squad is full (D18). */
export function MaxSafeBidValue({ view }: { view: MaxSafeBidView }) {
  if (view.displayedLakh === null) {
    return (
      <span>
        <span aria-hidden="true">—</span>
        <span className="sr-only">not applicable</span>
      </span>
    );
  }
  return <Money lakh={view.displayedLakh} />;
}
