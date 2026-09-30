import { franchisesQueryOptions } from "@/api";
import { ErrorState } from "@/components/common/ErrorState";
import { WorkspacePage } from "@/features/workspace";
import { workspaceSearchSchema } from "@/features/workspace/search";
import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamId")({
  validateSearch: workspaceSearchSchema,
  loader: async ({ context, params }) => {
    // Cached data if present, otherwise fetch (replaces ensureQueryData)
    const franchises = await context.queryClient.query({
      ...franchisesQueryOptions(),
      staleTime: "static",
    });
    if (!franchises.some((franchise) => franchise.id === params.teamId)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router's notFound() is designed to be thrown
      throw notFound();
    }
  },
  component: WorkspaceRoute,
  errorComponent: WorkspaceLoadError,
});

function WorkspaceRoute() {
  const { teamId } = Route.useParams();
  return <WorkspacePage teamId={teamId} />;
}

function WorkspaceLoadError() {
  const router = useRouter();
  return (
    <ErrorState
      title="Couldn't load this team."
      description="Check your connection and try again."
      className="max-w-xl"
      // Re-runs the loader; the error boundary's reset alone would not
      onRetry={() => {
        void router.invalidate();
      }}
    />
  );
}
