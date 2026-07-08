import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "Downloads — GridGuide AI" }, { name: "description", content: "PDF notes, flowcharts and cheat sheets for power system interns." }] }),
  component: Downloads,
});

const files = [
  { title: "SCADA — Master Notes", size: "2.4 MB", type: "PDF", topic: "SCADA" },
  { title: "IEC 60870-5-104 Cheatsheet", size: "820 KB", type: "PDF", topic: "Comms" },
  { title: "Protection Relays — Overview", size: "1.8 MB", type: "PDF", topic: "Protection" },
  { title: "PMU & WAMS — Handbook", size: "3.1 MB", type: "PDF", topic: "PMU" },
  { title: "EMS Applications — SE / OPF / AGC", size: "2.9 MB", type: "PDF", topic: "EMS" },
  { title: "Substation Automation IEC 61850", size: "3.6 MB", type: "PDF", topic: "Automation" },
];

function Downloads() {
  return (
    <PageShell eyebrow="Resources" title="Downloads" description="Concise, exam-ready notes and cheat sheets.">
      <div className="grid gap-3 md:grid-cols-2">
        {files.map((f) => (
          <div key={f.title} className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
              <FileText className="w-5 h-5 text-cyan" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{f.title}</span>
                <Badge variant="outline" className="text-[10px] border-white/15">{f.topic}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{f.type} · {f.size}</div>
            </div>
            <Button size="sm" variant="outline" className="glass border-white/15">
              <Download className="w-4 h-4 mr-1.5" /> Get
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
