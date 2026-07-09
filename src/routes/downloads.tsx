import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDownloadsFn } from "../lib/auth-functions";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — GridGuide AI" },
      { name: "description", content: "Markdown study guides, cheatsheets and handbooks for power system interns." },
    ],
  }),
  loader: async () => {
    const files = await getDownloadsFn();
    return { files };
  },
  component: Downloads,
});

function Downloads() {
  const { files } = Route.useLoaderData();

  return (
    <PageShell eyebrow="Resources" title="Downloads" description="Concise, exam-ready notes and cheat sheets.">
      {files.length === 0 ? (
        <div className="text-center py-12 glass rounded-3xl p-8 max-w-md mx-auto">
          <p className="text-muted-foreground">No resources available for download yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {files.map((f) => (
            <div key={f.id || f.title} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
                <FileText className="w-5 h-5 text-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{f.title}</span>
                  <Badge variant="outline" className="text-[10px] border-white/15">
                    {f.topic}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {f.type} · {f.size}
                </div>
              </div>
              <Button size="sm" variant="outline" className="glass border-white/15" asChild>
                <a href={f.filename.startsWith("http") ? f.filename : `/downloads/${f.filename}`} download={f.filename.replace(/^\d+-/, "")}>
                  <Download className="w-4 h-4 mr-1.5" /> Get
                </a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
