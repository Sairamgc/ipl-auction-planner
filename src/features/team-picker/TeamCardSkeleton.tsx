import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder with the shape of a TeamCard, so nothing shifts on load. */
export function TeamCardSkeleton() {
  return (
    <Card aria-hidden="true" className="h-full gap-4 rounded-lg pt-0">
      <Skeleton className="h-1 rounded-none" />
      <div className="flex items-center gap-3 px-4">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-2 px-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="px-4">
        <Skeleton className="h-5 w-20 rounded-4xl" />
      </div>
    </Card>
  );
}
