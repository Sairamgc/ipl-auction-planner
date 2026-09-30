interface DetailTriggerProps {
  name: string;
  onOpen: (trigger: HTMLElement) => void;
}

/**
 * A player's name as a button stretched over its row, opening the detail
 * dialog (flow 1, UI30). Row controls sit beside it, above the stretch.
 */
export function DetailTrigger({ name, onOpen }: DetailTriggerProps) {
  return (
    <button
      type="button"
      data-detail-trigger
      aria-label={`${name}, view details`}
      onClick={(event) => {
        onOpen(event.currentTarget);
      }}
      className="text-left font-medium outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
    >
      {name}
    </button>
  );
}
