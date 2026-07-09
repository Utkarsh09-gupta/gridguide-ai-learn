import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInternshipLogByIdFn } from "@/lib/auth-functions";

export const Route = createFileRoute("/logbook/$id")({
  loader: async ({ params }) => {
    try {
      const log = await getInternshipLogByIdFn({ data: { id: params.id } });
      if (!log) throw notFound();
      return { log };
    } catch (e) {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.log.title} — GridGuide AI` },
          { name: "description", content: loaderData.log.description },
        ]
      : [{ title: "Field Log — GridGuide AI" }],
  }),
  component: LogbookDetail,
  notFoundComponent: () => (
    <PageShell title="Log not found" description="This field note entry doesn't exist in our logbook.">
      <Button asChild>
        <Link to="/logbook">Back to Logbook</Link>
      </Button>
    </PageShell>
  ),
});

function LogbookDetail() {
  const { log } = Route.useLoaderData();

  // Custom markdown renderer for detailed content
  const renderMarkdown = (md: string) => {
    if (!md) return null;
    return md
      .split("\n\n")
      .map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="text-lg font-bold text-cyan mt-6 mb-2 border-b border-white/5 pb-1">
              {trimmed.replace("### ", "")}
            </h3>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={i} className="text-base font-semibold text-electric mt-4 mb-1">
              {trimmed.replace("#### ", "")}
            </h4>
          );
        }
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <ul key={i} className="list-disc pl-5 my-2 space-y-1 text-sm text-muted-foreground">
              {trimmed.split("\n").map((li, idx) => (
                <li key={idx}>{li.replace(/^[\*\-]\s+/, "")}</li>
              ))}
            </ul>
          );
        }
        if (trimmed.startsWith("1. ")) {
          return (
            <ol key={i} className="list-decimal pl-5 my-2 space-y-1 text-sm text-muted-foreground">
              {trimmed.split("\n").map((li, idx) => (
                <li key={idx}>{li.replace(/^\d+\.\s+/, "")}</li>
              ))}
            </ol>
          );
        }
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const code = lines.slice(1, -1).join("\n");
          return (
            <pre key={i} className="my-4 p-4 rounded-xl bg-navy-deep/80 border border-white/10 overflow-x-auto text-xs font-mono text-cyan">
              {code}
            </pre>
          );
        }
        return (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">
            {trimmed}
          </p>
        );
      });
  };

  return (
    <PageShell eyebrow={log.date} title={log.title} description={log.description}>
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6">
        <Link to="/logbook">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to logbook
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card with Text */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-display font-bold inline-flex items-center gap-2 text-cyan border-b border-white/10 pb-2 w-full">
              <BookOpen className="w-5 h-5" /> Field Observation Notes
            </h3>
            <div className="mt-4 prose prose-invert max-w-none">
              {renderMarkdown(log.content)}
            </div>
          </div>
        </div>

        {/* Sidebar Image Viewer & Metadata */}
        <div className="space-y-4">
          <div className="glass rounded-2xl overflow-hidden p-3 border border-white/10">
            <div className="text-[10px] uppercase font-mono text-muted-foreground/60 px-2 py-1 flex justify-between">
              <span>Photo Attachment</span>
              <span>UPSLDC Lucknow</span>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-navy/60 border border-white/10 mt-1">
              <img
                src={log.imageUrl}
                alt={log.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h4 className="font-semibold text-sm text-electric">Log Metadata</h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Timeline</span>
                <span className="font-mono text-cyan flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {log.date.split(" · ")[0]}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge className="bg-white/5 border-white/10 text-cyan uppercase text-[9px] font-mono tracking-wider">
                  {log.tag}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="text-foreground font-medium">Lucknow, Uttar Pradesh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
