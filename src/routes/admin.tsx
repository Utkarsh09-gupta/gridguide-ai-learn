import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Link } from "@tanstack/react-router";
import { Loader2, KeyRound } from "lucide-react";
import { checkAdminClearanceFn, verifyAdminKeyFn } from "../lib/auth-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const [clearanceLoading, setClearanceLoading] = useState(true);
  const [cleared, setCleared] = useState(false);
  const [key, setKey] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      checkAdminClearanceFn()
        .then((res) => {
          setCleared(res.cleared);
        })
        .catch(() => {
          setCleared(false);
        })
        .finally(() => {
          setClearanceLoading(false);
        });
    } else {
      setClearanceLoading(false);
    }
  }, [user]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    setVerifying(true);
    try {
      await verifyAdminKeyFn({ data: { key } });
      setCleared(true);
      toast.success("Admin Terminal Unlocked!");
    } catch (err: any) {
      toast.error(err.message || "Invalid Access Key");
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading || clearanceLoading) {
    return (
      <PageShell eyebrow="Admin Security" title="Verifying Clearance..." description="Authenticating access credentials...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <PageShell eyebrow="Access Blocked" title="Administrative Privilege Required" description="This terminal is reserved for grid administrators.">
        <div className="text-center py-10 glass rounded-3xl p-8 max-w-md mx-auto border border-red-500/20">
          <p className="text-muted-foreground mb-6">Your account does not possess grid control credentials required to operate this interface.</p>
          <Button asChild className="bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 glow-primary">
            <Link to="/">Return to Control Room</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!cleared) {
    return (
      <PageShell eyebrow="Terminal Locked" title="Secure Gate Access" description="Enter the Admin Terminal Access Key to continue.">
        <div className="text-center py-10 glass rounded-3xl p-8 max-w-md mx-auto border border-yellow-500/20">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 mx-auto mb-6">
            <KeyRound className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Terminal Access Locked</h3>
          <p className="text-xs text-muted-foreground mb-6">A secondary authorization key is required to modify power grid specifications.</p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Admin Terminal Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="text-center font-mono glass"
              required
            />
            <Button
              type="submit"
              disabled={verifying}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-primary-foreground border-0 glow-yellow mt-2 font-medium"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
                </>
              ) : (
                "Unlock Console"
              )}
            </Button>
          </form>
        </div>
      </PageShell>
    );
  }

  return <Outlet />;
}
