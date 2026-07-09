import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Plus, Trash2, Calendar, Tag, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getInternshipLogsFn, addInternshipLogFn, deleteInternshipLogFn, uploadFileFn } from "../lib/auth-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logs")({
  loader: async () => {
    const logs = await getInternshipLogsFn();
    return { logs };
  },
  component: AdminLogsManager,
});

function AdminLogsManager() {
  const { logs } = Route.useLoaderData();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "logbook");

    setUploading(true);
    try {
      const res = await uploadFileFn({ data: formData });
      setImageUrl(res.url);
      toast.success("Logbook image uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !tag || !description || !imageUrl || !content) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    setSubmitting(true);
    try {
      await addInternshipLogFn({
        data: {
          title,
          date,
          tag,
          description,
          imageUrl,
          content,
        },
      });
      toast.success("Log entry added successfully!");
      // Reset form
      setTitle("");
      setDate("");
      setTag("");
      setDescription("");
      setImageUrl("");
      setContent("");
      // Reload route data
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add log entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;

    setDeletingId(id);
    try {
      await deleteInternshipLogFn({ data: { id } });
      toast.success("Log entry deleted successfully!");
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete log entry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell eyebrow="Admin Console" title="Field Logbook Manager" description="Author and manage chronology logs of substation and control room visits.">
      <div className="max-w-6xl mx-auto mt-4 grid gap-8 lg:grid-cols-3">
        {/* Logs Form Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-1 h-fit">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
            <Plus className="w-5 h-5 text-yellow-400" /> New Log Entry
          </h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date (e.g. Day 6 · July 12, 2026)</label>
              <Input
                placeholder="Day 6 · July 12, 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Tag (e.g. Substation, Control Room)</label>
              <Input
                placeholder="Substation"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Title</label>
              <Input
                placeholder="Meja 400kV Control Room Visit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Summary / Description</label>
              <Input
                placeholder="Brief summary of what was observed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Reference Photo</label>
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
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Detailed Log Content (Markdown)</label>
              <textarea
                placeholder="Write your observation notes in Markdown format..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1.5 w-full min-h-[140px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan transition"
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                "Commit Log Entry"
              )}
            </Button>
          </form>
        </div>

        {/* Logs Timeline List Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
            <ClipboardList className="w-5 h-5 text-yellow-400" /> Log Chronology ({logs.length})
          </h3>

          {logs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No logs registered yet. Create one on the left panel!
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-yellow-500/10 transition duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={log.imageUrl} alt={log.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{log.title}</div>
                      <div className="flex flex-wrap gap-2 items-center text-[10px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-yellow-400" /> {log.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-cyan" /> {log.tag}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-electric" /> {log.content.length} chars
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(log.id)}
                    disabled={deletingId === log.id}
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    {deletingId === log.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
