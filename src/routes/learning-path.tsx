import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/learning-path")({
  component: () => <Outlet />,
});
