import { TeamPickerPage } from "@/features/team-picker";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TeamPickerPage,
});
