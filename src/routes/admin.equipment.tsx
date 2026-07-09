import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Cpu, Plus, Edit2, Trash2, Tag, Loader2, Image as ImageIcon, Save, X } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getEquipmentListFn, addEquipmentFn, updateEquipmentFn, deleteEquipmentFn, uploadFileFn } from "../lib/auth-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/equipment")({
  loader: async () => {
    const list = await getEquipmentListFn();
    return { list };
  },
  component: AdminEquipmentManager,
});

function AdminEquipmentManager() {
  const { list } = Route.useLoaderData();
  const router = useRouter();

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [full, setFull] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [standards, setStandards] = useState("");
  const [interfaces, setInterfaces] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [detailedContent, setDetailedContent] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "equipment");

    setUploading(true);
    try {
      const res = await uploadFileFn({ data: formData });
      setImageUrl(res.url);
      toast.success("Equipment image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setId(item.id);
    setName(item.name);
    setFull(item.full);
    setTag(item.tag);
    setDescription(item.description);
    setStandards(item.standards || "");
    setInterfaces(item.interfaces || "");
    setImageUrl(item.imageUrl || "");
    setDetailedContent(item.detailedContent || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setId("");
    setName("");
    setFull("");
    setTag("");
    setDescription("");
    setStandards("");
    setInterfaces("");
    setImageUrl("");
    setDetailedContent("");
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !full || !tag || !description || !imageUrl || !detailedContent) {
      toast.error("Please fill in all required fields and upload an image.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateEquipmentFn({
          data: {
            id,
            name,
            full,
            tag,
            description,
            detailedContent,
            standards,
            interfaces,
            imageUrl,
          },
        });
        toast.success("Equipment updated successfully!");
      } else {
        await addEquipmentFn({
          data: {
            id,
            name,
            full,
            tag,
            description,
            detailedContent,
            standards,
            interfaces,
            imageUrl,
          },
        });
        toast.success("Equipment added successfully!");
      }
      handleCancelEdit();
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save equipment spec.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetId: string) => {
    if (!confirm(`Are you sure you want to delete "${targetId}"?`)) return;

    setDeletingId(targetId);
    try {
      await deleteEquipmentFn({ data: { id: targetId } });
      toast.success("Equipment deleted successfully!");
      if (isEditing && id === targetId) {
        handleCancelEdit();
      }
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete equipment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell eyebrow="Admin Console" title="Equipment Specifications Manager" description="Edit or create substation and control room hardware profiles.">
      <div className="max-w-7xl mx-auto mt-4 grid gap-8 lg:grid-cols-3">
        {/* Editor Form Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-1 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
              {isEditing ? (
                <>
                  <Edit2 className="w-5 h-5 text-yellow-400" /> Edit Spec ({id})
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-yellow-400" /> New Equipment Spec
                </>
              )}
            </h3>
            {isEditing && (
              <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unique ID (lowercase, e.g. "rtu", "ct")</label>
              <Input
                placeholder="rtu"
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                disabled={isEditing}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Name (e.g. "RTU")</label>
              <Input
                placeholder="RTU"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Tech Name (e.g. "Remote Terminal Unit")</label>
              <Input
                placeholder="Remote Terminal Unit"
                value={full}
                onChange={(e) => setFull(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Tag (e.g. "SCADA", "Automation")</label>
              <Input
                placeholder="SCADA"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brief Description</label>
              <Input
                placeholder="Field device that acquires telemetry..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Standards (e.g. "IEC 60870-5-104")</label>
              <Input
                placeholder="IEC 60870-5-101, IEC 60870-5-104"
                value={standards}
                onChange={(e) => setStandards(e.target.value)}
                className="mt-1.5 glass"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interfaces (e.g. "RJ45 Ethernet")</label>
              <Input
                placeholder="RS-232, RS-485, RJ45 Ethernet"
                value={interfaces}
                onChange={(e) => setInterfaces(e.target.value)}
                className="mt-1.5 glass"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hardware Photo</label>
              <div className="mt-1.5 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="glass border-white/15 cursor-pointer relative"
                  disabled={uploading}
                  asChild
                >
                  <label>
                    <ImageIcon className="w-4 h-4 mr-2 text-yellow-400" />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </Button>
                {imageUrl && (
                  <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {imageUrl.split("/").pop()}
                  </div>
                )}
              </div>
              {imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-h-32">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Working Principle & Loop Testing Notes (Markdown)</label>
              <textarea
                placeholder="Write technical specifications and telemetry loop test steps in Markdown..."
                value={detailedContent}
                onChange={(e) => setDetailedContent(e.target.value)}
                className="mt-1.5 w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan transition"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-primary-foreground border-0 glow-yellow mt-2 font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Specifications
                </>
              ) : (
                "Create Hardware Profile"
              )}
            </Button>
          </form>
        </div>

        {/* Equipment Spec List Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
            <Cpu className="w-5 h-5 text-yellow-400" /> Equipment Registry ({list.length})
          </h3>

          {list.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No equipment registered. Add one on the left panel!
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {list.map((e: any) => (
                <div key={e.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-yellow-500/10 transition duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
                      {e.imageUrl ? (
                        <img src={e.imageUrl} alt={e.name} className="w-full h-full object-cover" />
                      ) : (
                        <Cpu className="w-6 h-6 text-yellow-400/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{e.name}</span>
                        <span className="text-[10px] bg-white/5 border border-white/10 text-cyan rounded-md px-1.5 py-0.5 font-mono">{e.id}</span>
                        <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 rounded-md px-1.5 py-0.5">{e.tag}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {e.full}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditClick(e)}
                      className="text-cyan hover:bg-cyan/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(e.id)}
                      disabled={deletingId === e.id}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      {deletingId === e.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
