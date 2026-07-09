import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ModuleCard } from "@/components/ModuleCard";
import { modules as staticModules } from "@/data/modules";
import { getModulesFn } from "@/lib/auth-functions";

export const Route = createFileRoute("/learning-path/")({
  loader: async () => {
    try {
      const dbModules = await getModulesFn();
      return { dbModules };
    } catch (e) {
      console.error("Failed to load modules for learning path:", e);
      return { dbModules: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Learning Path — GridGuide AI" },
      { name: "description", content: "A structured 10-module roadmap covering Power Systems, SCADA, EMS, Protection, PMU/WAMS and more." },
    ],
  }),
  component: LearningPath,
});

function LearningPath() {
  const { dbModules } = Route.useLoaderData();
  const activeModules = dbModules && dbModules.length > 0 ? dbModules : staticModules;

  return (
    <PageShell
      eyebrow="Curriculum"
      title="Learning Path"
      description="A guided roadmap from power system fundamentals to advanced substation automation and wide-area monitoring."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeModules.map((m, i) => <ModuleCard key={m.id} m={m} i={i} />)}
      </div>
    </PageShell>
  );
}
