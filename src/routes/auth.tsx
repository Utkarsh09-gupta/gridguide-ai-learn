import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Zap, ShieldCheck, Mail, Lock, User, Building2, Loader2, RefreshCw } from "lucide-react";
import { SiteLayout } from "../components/layout/SiteLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Portal Access — GridGuide AI" },
      { name: "description", content: "Sign in or register to access the full-stack GridGuide AI learning platform." },
    ],
  }),
  component: AuthPage,
});

const organizations = [
  { value: "UPSLDC", label: "Uttar Pradesh State Load Despatch Centre (UPSLDC)" },
  { value: "PGCIL", label: "Power Grid Corporation of India (PGCIL)" },
  { value: "NRLDC", label: "Northern Regional Load Despatch Centre (NRLDC)" },
  { value: "WRLDC", label: "Western Regional Load Despatch Centre (WRLDC)" },
  { value: "SRLDC", label: "Southern Regional Load Despatch Centre (SRLDC)" },
  { value: "ERLDC", label: "Eastern Regional Load Despatch Centre (ERLDC)" },
  { value: "NERLDC", label: "North Eastern Regional Load Despatch Centre (NERLDC)" },
  { value: "OTHER", label: "Other / University Student" },
];

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("UPSLDC");
  const [submitting, setSubmitting] = useState(false);

  const { login, signup, user } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();

  // If already logged in, redirect to home or redirect destination
  if (user) {
    navigate({ to: redirect || "/" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Successfully logged in!");
      } else {
        await signup(name, email, password, organization);
        toast.success("Account created successfully!");
      }
      router.invalidate();
      navigate({ to: redirect || "/" });
    } catch (err: any) {
      toast.error(err.message || "An authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center py-12 px-4">
        {/* Dynamic Glowing Background Circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-electric/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-xs text-muted-foreground mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan animate-pulse" />
              Secured SCADA Terminal Interface
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gradient">
              {isLogin ? "System Login" : "Intern Registration"}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin
                ? "Enter your credentials to access your digital twin workspace."
                : "Register your profile to start tracking your learning path."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="glass-strong rounded-3xl p-8 relative overflow-hidden border border-white/10 shadow-2xl shadow-electric/5"
          >
            {/* Top Border Glow Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />

            {/* Form Mode Toggle */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin
                    ? "bg-gradient-to-r from-electric to-cyan text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isLogin
                    ? "bg-gradient-to-r from-electric to-cyan text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Only Fields */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Aarav Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass pl-10 h-11 border-white/15 focus:border-electric/50"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@organization.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass pl-10 h-11 border-white/15 focus:border-electric/50"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass pl-10 h-11 border-white/15 focus:border-electric/50"
                    required
                  />
                </div>
              </div>

              {/* Registration Only: Organization Dropdown */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="organization" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Affiliated Grid Organization
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      id="organization"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="flex w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass pl-10 h-11 focus:border-electric/50 text-foreground"
                    >
                      {organizations.map((org) => (
                        <option key={org.value} value={org.value} className="bg-navy text-foreground">
                          {org.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Actions */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 h-11 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 hover:opacity-90 transition glow-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : isLogin ? (
                  "Access Terminal"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
