import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, GraduationCap, Trophy } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Progress } from "@/components/ui/progress";
import { recentLearning } from "@/data/site";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — GridGuide AI" }, { name: "description", content: "Track your progress across GridGuide AI modules." }] }),
  component: Profile,
});

function Profile() {
  return (
    <PageShell eyebrow="Your progress" title="Profile" description="A snapshot of your GridGuide journey.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-strong rounded-3xl p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-electric to-cyan text-2xl font-semibold text-primary-foreground">
              AK
            </div>
            <div>
              <div className="font-semibold text-lg">Aarav Kumar</div>
              <div className="text-xs text-muted-foreground">Intern · UPSLDC</div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat icon={GraduationCap} v="7" l="Modules" />
            <Stat icon={Trophy} v="12" l="Quizzes" />
            <Stat icon={Flame} v="14d" l="Streak" />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-semibold flex items-center gap-2"><Award className="w-4 h-4 text-cyan" /> Continue learning</h3>
          <div className="mt-4 space-y-4">
            {recentLearning.map((r) => (
              <div key={r.title}>
                <div className="flex items-center justify-between text-sm">
                  <span>{r.title}</span>
                  <span className="text-muted-foreground">{r.progress}%</span>
                </div>
                <Progress value={r.progress} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Stat({ icon: Icon, v, l }: { icon: React.ElementType; v: string; l: string }) {
  return (
    <div className="glass rounded-xl py-3">
      <Icon className="w-4 h-4 mx-auto text-cyan" />
      <div className="mt-1 font-display font-semibold">{v}</div>
      <div className="text-[11px] text-muted-foreground">{l}</div>
    </div>
  );
}
