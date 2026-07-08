import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { ModuleCard } from "@/components/ModuleCard";
import { modules } from "@/data/modules";

export const Route = createFileRoute("/learning-path")({
  head: () => ({
    meta: [
      { title: "Learning Path — GridGuide AI" },
      { name: "description", content: "A structured 10-module roadmap covering Power Systems, SCADA, EMS, Protection, PMU/WAMS and more." },
    ],
  }),
  component: LearningPath,
});

function LearningPath() {
  return (
    <PageShell
      eyebrow="Curriculum"
      title="Learning Path"
      description="A guided roadmap from power system fundamentals to advanced substation automation and wide-area monitoring."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m, i) => <ModuleCard key={m.id} m={m} i={i} />)}
      </div>
    </PageShell>
  );
}
