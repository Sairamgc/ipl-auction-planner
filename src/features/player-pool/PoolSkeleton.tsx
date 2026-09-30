import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 8;

/** First-page placeholder shaped like the rows (UI3). */
export function PoolSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      {Array.from({ length: ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
