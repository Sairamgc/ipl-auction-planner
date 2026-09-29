import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TeamPickerPage,
});

// Placeholder until the team-picker feature is built
function TeamPickerPage() {
  return <h1 className="p-4 text-2xl font-semibold">IPL Auction Planner</h1>;
}
