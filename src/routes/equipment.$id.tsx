import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Cable, Info } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { getEquipmentByIdFn } from "@/lib/auth-functions";
import { getEquipmentIcon } from "@/components/EquipmentCard";

export const Route = createFileRoute("/equipment/$id")({
  loader: async ({ params }) => {
    try {
      const item = await getEquipmentByIdFn({ data: { id: params.id } });
      if (!item) throw notFound();
      return { item };
    } catch (e) {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.name} — GridGuide AI` },
          { name: "description", content: loaderData.item.description },
        ]
      : [{ title: "Equipment — GridGuide AI" }],
  }),
  component: EquipmentDetail,
  notFoundComponent: () => (
    <PageShell title="Equipment not found" description="This device doesn't exist in our catalogue.">
      <Button asChild>
        <Link to="/equipment">Back to catalogue</Link>
      </Button>
    </PageShell>
  ),
});

function EquipmentDetail() {
  const { item } = Route.useLoaderData();
  const Icon = getEquipmentIcon(item.id);

  // Split standards and interfaces lists
  const standardsList = item.standards
    ? item.standards.split(",").map((s: string) => s.trim())
    : ["No industrial standards listed"];

  const interfacesList = item.interfaces
    ? item.interfaces.split(",").map((inf: string) => inf.trim())
    : ["No telemetry interfaces listed"];

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
    <PageShell eyebrow={item.tag} title={item.full} description={item.description}>
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6">
        <Link to="/equipment">
          <ArrowLeft className="w-4 h-4 mr-1" /> All equipment
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 glass rounded-2xl p-8">
          <div className="relative w-full h-80 rounded-xl overflow-hidden bg-navy/60 border border-white/10 mb-6">
            <img
              src={item.imageUrl || `/images/equipment/${item.id}.png`}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 grid place-items-center w-12 h-12 rounded-xl bg-navy/80 backdrop-blur-md border border-white/10 text-cyan">
              <Icon className="w-6 h-6" />
            </div>
          </div>

          <h3 className="text-xl font-bold inline-flex items-center gap-2 text-cyan">
            <Info className="w-5 h-5" /> Technical Specification Guide
          </h3>
          <div className="mt-4 prose prose-invert max-w-none">
            {item.detailedContent ? (
              renderMarkdown(item.detailedContent)
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Detailed learning material for the {item.name} ({item.full}) is currently loading...
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h4 className="font-semibold inline-flex items-center gap-2 text-electric">
              <BookOpen className="w-4 h-4 text-cyan" /> Standards & References
            </h4>
            <ul className="mt-3 text-sm text-muted-foreground space-y-2">
              {standardsList.map((std: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan font-bold select-none">•</span>
                  <span>{std}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <h4 className="font-semibold inline-flex items-center gap-2 text-electric">
              <Cable className="w-4 h-4 text-cyan" /> Interfaces & Protocols
            </h4>
            <div className="flex flex-wrap gap-2 mt-3">
              {interfacesList.map((inf: string, idx: number) => (
                <span key={idx} className="px-2 py-1 text-[11px] font-mono rounded bg-white/5 border border-white/10 text-cyan">
                  {inf}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
