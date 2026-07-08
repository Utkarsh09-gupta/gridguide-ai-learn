import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { EquipmentCard } from "@/components/EquipmentCard";
import { equipment } from "@/data/equipment";

export const Route = createFileRoute("/equipment/")({
  head: () => ({
    meta: [
      { title: "Equipment Explorer — GridGuide AI" },
      { name: "description", content: "Explore every device that lives in a modern substation and control centre: RTU, IED, CT, PT, relays and more." },
    ],
  }),
  component: EquipmentIndex,
});

function EquipmentIndex() {
  return (
    <PageShell
      eyebrow="Hardware"
      title="Equipment Explorer"
      description="Tap any card to open detailed notes, images and typical connection diagrams."
    >
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {equipment.map((e, i) => <EquipmentCard key={e.id} e={e} i={i} />)}
      </div>
    </PageShell>
  );
}
