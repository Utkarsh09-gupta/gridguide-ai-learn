import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInternshipLogsFn } from "@/lib/auth-functions";
import { Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/logbook/")({
  loader: async () => {
    try {
      const data = await getInternshipLogsFn();
      return { list: data };
    } catch (e) {
      return { list: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Field Logbook — GridGuide AI" },
      { name: "description", content: "Chronological diary of substation explorations, telemetry audits, and control room shifts." },
    ],
  }),
  component: LogbookIndex,
});

function LogbookIndex() {
  const { list } = Route.useLoaderData();

  return (
    <PageShell
      eyebrow="Exploration"
      title="Field Logbook"
      description="Chronological logbook of real-world substation site visits, telemetry system audits, and control room shifts."
    >
      {list.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground italic">No log entries found. Run the database seeder to populate field notes.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((log: any) => (
            <div key={log.id} className="glass rounded-2xl overflow-hidden flex flex-col border border-white/10 group hover:border-cyan/30 transition-all duration-300">
              {/* Image Header */}
              <div className="relative w-full h-48 overflow-hidden bg-navy/60 border-b border-white/5">
                <img
                  src={log.imageUrl}
                  alt={log.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-navy/80 backdrop-blur-sm border-white/15 text-[10px] text-cyan uppercase tracking-wider font-mono">
                    {log.tag}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan" />
                    <span>{log.date}</span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground group-hover:text-cyan transition-colors leading-snug">
                    {log.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {log.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/60 font-mono">UPSLDC Lucknow</span>
                  <Button size="sm" variant="ghost" className="text-xs text-cyan hover:text-cyan-light p-0 h-auto hover:bg-transparent" asChild>
                    <Link to={`/logbook/${log.id}`}>
                      Read Log <ArrowRight className="w-3.5 h-3.5 ml-1 inline group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
