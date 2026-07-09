import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Flame, GraduationCap, Trophy, Loader2 } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../hooks/useAuth";
import { getUserProfileStatsFn } from "../lib/auth-functions";
import { Button } from "../components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — GridGuide AI" }, { name: "description", content: "Track your progress across GridGuide AI modules." }] }),
  component: Profile,
});

interface ProfileStats {
  user: {
    name: string;
    email: string;
    organization: string | null;
    streakCount: number;
  };
  progress: Array<{ title: string; progress: number }>;
  stats: {
    modulesCount: number;
    completedModules: number;
    quizzesTaken: number;
  };
}

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
      return;
    }

    if (user) {
      getUserProfileStatsFn()
        .then((data) => {
          if (data) setProfileData(data);
        })
        .catch((err) => console.error("Error loading profile stats:", err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <PageShell eyebrow="Loading" title="Loading Profile..." description="Establishing secure link to database...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!user || !profileData) {
    return (
      <PageShell eyebrow="Access Denied" title="Authentication Required" description="You must be logged in to view your profile.">
        <div className="text-center py-10 glass rounded-3xl p-8 max-w-md mx-auto">
          <p className="text-muted-foreground mb-6">Please log in to track your learning progress, achievements, and quizzes.</p>
          <Button asChild className="bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 glow-primary">
            <Link to="/auth">Access Terminal</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <PageShell eyebrow="Your progress" title="Profile" description="A snapshot of your GridGuide journey.">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-strong rounded-3xl p-6 lg:col-span-1 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-electric to-cyan text-2xl font-semibold text-primary-foreground shrink-0 glow-primary">
              {getInitials(profileData.user.name)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-lg truncate">{profileData.user.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {profileData.user.organization ? `Intern · ${profileData.user.organization}` : "Grid Explorer"}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat icon={GraduationCap} v={String(profileData.stats.modulesCount)} l="In Progress" />
            <Stat icon={Trophy} v={String(profileData.stats.quizzesTaken)} l="Quizzes" />
            <Stat icon={Flame} v={`${profileData.user.streakCount}d`} l="Streak" />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2 border border-white/10">
          <h3 className="font-semibold flex items-center gap-2"><Award className="w-4 h-4 text-cyan animate-pulse" /> Current Progress</h3>
          <div className="mt-6 space-y-5">
            {profileData.progress.map((r) => (
              <div key={r.title} className="group">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium group-hover:text-cyan transition-colors">{r.title}</span>
                  <span className="text-muted-foreground font-mono">{r.progress}%</span>
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
    <div className="glass rounded-xl py-3 border border-white/5 hover:border-cyan/20 transition-all duration-200">
      <Icon className="w-4 h-4 mx-auto text-cyan" />
      <div className="mt-1.5 font-display font-semibold text-gradient">{v}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{l}</div>
    </div>
  );
}
