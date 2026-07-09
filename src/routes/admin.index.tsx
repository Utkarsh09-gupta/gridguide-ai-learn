import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "../components/layout/PageShell";
import { Cpu, ClipboardList, Download, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex,
});

function AdminIndex() {
  return (
    <PageShell eyebrow="Grid Management Terminal" title="Admin Control Center" description="Manage database telemetry, resources and substation specifications.">
      <div className="max-w-6xl mx-auto mt-6">
        <div className="glass rounded-3xl p-6 border border-yellow-500/10 bg-yellow-500/5 mb-8 flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-yellow-400 shrink-0 animate-pulse" />
          <div>
            <h3 className="font-semibold text-yellow-300">Terminal Authorization Success</h3>
            <p className="text-xs text-muted-foreground mt-0.5">You possess complete administrative read/write credentials to edit database nodes and file directories.</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/logs"
            className="group glass hover:border-yellow-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between h-48 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mt-4 group-hover:text-yellow-400 transition-colors">Field Logbook</h3>
              <p className="text-xs text-muted-foreground mt-1">Add, edit or delete timeline logs and screenshots.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium mt-4">
              Access Terminal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/equipment"
            className="group glass hover:border-yellow-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between h-48 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mt-4 group-hover:text-yellow-400 transition-colors">Equipment Explorer</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure hardware parameters and interfaces.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium mt-4">
              Access Terminal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/downloads"
            className="group glass hover:border-yellow-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between h-48 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mt-4 group-hover:text-yellow-400 transition-colors">Downloads Manager</h3>
              <p className="text-xs text-muted-foreground mt-1">Upload markdown guides and cheat sheets dynamically.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium mt-4">
              Access Terminal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/modules"
            className="group glass hover:border-yellow-500/30 transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between h-48 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mt-4 group-hover:text-yellow-400 transition-colors">Curriculum Manager</h3>
              <p className="text-xs text-muted-foreground mt-1">Configure training modules, lesson topics, and quizzes dynamically.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium mt-4">
              Access Terminal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
