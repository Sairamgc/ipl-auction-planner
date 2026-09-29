import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamId")({
  component: WorkspacePage,
});

// Placeholder until the workspace feature is built
function WorkspacePage() {
  const { teamId } = Route.useParams();
  return <h1 className="p-4 text-2xl font-semibold">Workspace: {teamId}</h1>;
}
