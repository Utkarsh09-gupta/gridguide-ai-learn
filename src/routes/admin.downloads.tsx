import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Trash2, Tag, FileText, Loader2 } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { getDownloadsFn, addDownloadFn, deleteDownloadFn, uploadFileFn } from "../lib/auth-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/downloads")({
  loader: async () => {
    const list = await getDownloadsFn();
    return { list };
  },
  component: AdminDownloadsManager,
});

function AdminDownloadsManager() {
  const { list } = Route.useLoaderData();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [filename, setFilename] = useState("");
  const [size, setSize] = useState("");
  const [type, setType] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Auto-calculate size and type
    const fileSizeKb = (file.size / 1024).toFixed(1);
    const calculatedSize = `${fileSizeKb} KB`;
    const calculatedType = file.name.split(".").pop()?.toUpperCase() || "File";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "downloads");

    setUploading(true);
    try {
      const res = await uploadFileFn({ data: formData });
      setFilename(res.filename);
      setSize(calculatedSize);
      setType(calculatedType);
      toast.success(`Resource file "${res.filename}" uploaded successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic || !filename || !size || !type) {
      toast.error("Please fill in all fields and upload a file first.");
      return;
    }

    setSubmitting(true);
    try {
      await addDownloadFn({
        data: {
          title,
          filename,
          size,
          type,
          topic,
        },
      });
      toast.success("Study resource added successfully!");
      // Reset form
      setTitle("");
      setTopic("");
      setFilename("");
      setSize("");
      setType("");
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add study resource.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    setDeletingId(id);
    try {
      await deleteDownloadFn({ data: { id } });
      toast.success("Resource deleted successfully!");
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete resource.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell eyebrow="Admin Console" title="Downloads Manager" description="Upload study materials, specifications, and cheatsheets for interns." backUrl="/admin">
      <div className="max-w-6xl mx-auto mt-4 grid gap-8 lg:grid-cols-3">
        {/* Resource Form Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-1 h-fit">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
            <Plus className="w-5 h-5 text-yellow-400" /> New Downloadable Resource
          </h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resource Title</label>
              <Input
                placeholder="SCADA — Master Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic Area (e.g. SCADA, Comms, Protection)</label>
              <Input
                placeholder="SCADA"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5 glass"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload Study File</label>
              <div className="mt-1.5 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="glass border-white/15 cursor-pointer relative"
                  disabled={uploading}
                  asChild
                >
                  <label>
                    <FileText className="w-4 h-4 mr-2 text-yellow-400" />
                    {uploading ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </Button>
                {filename && (
                  <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {filename.split("-").slice(1).join("-")}
                  </div>
                )}
              </div>
              {filename && (
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                  <div><span className="text-muted-foreground font-semibold">File Type:</span> {type}</div>
                  <div><span className="text-muted-foreground font-semibold">File Size:</span> {size}</div>
                  <div className="truncate"><span className="text-muted-foreground font-semibold">Server Name:</span> {filename}</div>
                </div>
              )}
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
                "Publish Study Resource"
              )}
            </Button>
          </form>
        </div>

        {/* Resources List Panel */}
        <div className="glass rounded-3xl p-6 border border-white/10 lg:col-span-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-300">
            <Download className="w-5 h-5 text-yellow-400" /> Active Downloads Registry ({list.length})
          </h3>

          {list.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No files registered yet. Upload one on the left panel!
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {list.map((dl) => (
                <div key={dl.id} className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-yellow-500/10 transition duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{dl.title}</span>
                        <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 rounded-md px-1.5 py-0.5">{dl.topic}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate mt-1">
                        {dl.type} · {dl.size} · File: <span className="font-mono">{dl.filename}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(dl.id)}
                    disabled={deletingId === dl.id}
                    className="text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    {deletingId === dl.id ? (
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
