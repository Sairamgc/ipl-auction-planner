import { franchisesQueryOptions, useFranchise } from "@/api";
import { ErrorState } from "@/components/common/ErrorState";
import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from "@tanstack/react-router";

/**
 * Placeholder workspace (UI7): proves navigation from the picker until the
 * workspace is built. Unknown team ids show the not-found page.
 */
export const Route = createFileRoute("/teams/$teamId")({
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
  component: WorkspacePlaceholder,
  errorComponent: WorkspaceLoadError,
});

function WorkspacePlaceholder() {
  const { teamId } = Route.useParams();
  const { data: franchise } = useFranchise(teamId);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{franchise?.name}</h1>
      <p className="text-muted-foreground">The workspace is coming next.</p>
      <Link to="/" className="text-primary underline underline-offset-4">
        Back to all teams
      </Link>
    </div>
  );
}

function WorkspaceLoadError() {
  const router = useRouter();
  return (
    <ErrorState
      title="Couldn't load this team."
      // Re-runs the loader; the error boundary's reset alone would not
      onRetry={() => {
        void router.invalidate();
      }}
    />
  );
}
