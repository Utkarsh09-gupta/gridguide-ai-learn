import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GridGuide AI — Smart Learning for Power System & SCADA Interns" },
      { name: "description", content: "Learn SCADA, EMS, Protection, Communication Systems and Power Grid Operations from one AI-powered platform built for UPSLDC, PGCIL and RLDC interns." },
      { property: "og:title", content: "GridGuide AI — Smart Learning for Power System & SCADA Interns" },
      { property: "og:description", content: "Learn SCADA, EMS, Protection, Communication Systems and Power Grid Operations from one AI-powered platform built for UPSLDC, PGCIL and RLDC interns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GridGuide AI — Smart Learning for Power System & SCADA Interns" },
      { name: "twitter:description", content: "Learn SCADA, EMS, Protection, Communication Systems and Power Grid Operations from one AI-powered platform built for UPSLDC, PGCIL and RLDC interns." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/660af826-cda9-49af-9e2c-f841dadb49b0" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/660af826-cda9-49af-9e2c-f841dadb49b0" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider, useAuth } from "../hooks/useAuth";
import { Toaster } from "../components/ui/sonner";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    const isPublicPath = path === "/" || path.startsWith("/auth");
    if (!loading && !user && !isPublicPath) {
      navigate({ to: "/auth", search: { redirect: path } });
    }
  }, [user, loading, path, navigate]);

  const isPublicPath = path === "/" || path.startsWith("/auth");

  if (loading && !isPublicPath) {
    return (
      <PageShell eyebrow="Security" title="Authenticating..." description="Verifying portal access credentials...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan animate-spin" />
        </div>
      </PageShell>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGuard>
          <Outlet />
        </AuthGuard>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
