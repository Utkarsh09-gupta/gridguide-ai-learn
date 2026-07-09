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

          <h3 className="text-lg font-semibold inline-flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan" /> Overview
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Detailed learning material for the {item.name} ({item.full}) is on its way. This placeholder page will include working principles, typical wiring, protocols, standards and interview questions.
          </p>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h4 className="font-semibold inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan" /> Related notes
            </h4>
            <ul className="mt-3 text-sm text-muted-foreground space-y-2">
              <li>· Standards & references</li>
              <li>· Commissioning checklist</li>
              <li>· Common faults</li>
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <h4 className="font-semibold inline-flex items-center gap-2">
              <Cable className="w-4 h-4 text-cyan" /> Interfaces
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Typical interfaces and protocols will be documented here.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
