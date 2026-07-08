import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { whyPoints } from "@/data/site";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — GridGuide AI" }, { name: "description", content: "Why GridGuide AI exists and who it's built for." }] }),
  component: About,
});

function About() {
  return (
    <PageShell eyebrow="About" title="Built for interns at India's Load Dispatch Centres" description="GridGuide AI brings SCADA, EMS, Protection, Communications and grid operations into one focused learning space.">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass rounded-2xl p-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Engineering interns at utilities like <b className="text-foreground">UPSLDC, PGCIL and the RLDCs</b> face
            a firehose of new topics — from CT/PT wiring to synchrophasors and
            wide-area monitoring. Documentation is scattered across manuals,
            standards and tribal knowledge.
          </p>
          <p>
            GridGuide AI is a single, opinionated learning space that pulls it
            all together with practical notes, real photos, animated
            flowcharts, quizzes and an AI tutor available around the clock.
          </p>
          <p>
            Our goal is simple: help the next generation of grid operators
            walk into their first control-room shift already fluent.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {whyPoints.map((w) => (
            <div key={w.title} className="glass rounded-2xl p-5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <h3 className="mt-2 font-semibold">{w.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
