import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — GridGuide AI" },
      { name: "description", content: "Markdown study guides, cheatsheets and handbooks for power system interns." },
    ],
  }),
  component: Downloads,
});

const files = [
  {
    title: "SCADA — Master Notes",
    filename: "scada_master_notes.md",
    size: "4.5 KB",
    type: "Markdown",
    topic: "SCADA",
  },
  {
    title: "IEC 60870-5-104 Cheatsheet",
    filename: "iec104_cheatsheet.md",
    size: "3.8 KB",
    type: "Markdown",
    topic: "Comms",
  },
  {
    title: "Protection Relays — Overview",
    filename: "protection_relays_overview.md",
    size: "3.2 KB",
    type: "Markdown",
    topic: "Protection",
  },
  {
    title: "PMU & WAMS — Handbook",
    filename: "pmu_wams_handbook.md",
    size: "2.8 KB",
    type: "Markdown",
    topic: "PMU",
  },
  {
    title: "EMS Applications — SE / OPF / AGC",
    filename: "ems_applications_handbook.md",
    size: "3.5 KB",
    type: "Markdown",
    topic: "EMS",
  },
  {
    title: "Substation Automation IEC 61850",
    filename: "substation_automation_iec61850.md",
    size: "4.2 KB",
    type: "Markdown",
    topic: "Automation",
  },
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
                <Badge variant="outline" className="text-[10px] border-white/15">
                  {f.topic}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {f.type} · {f.size}
              </div>
            </div>
            <Button size="sm" variant="outline" className="glass border-white/15" asChild>
              <a href={`/downloads/${f.filename}`} download={f.filename}>
                <Download className="w-4 h-4 mr-1.5" /> Get
              </a>
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
