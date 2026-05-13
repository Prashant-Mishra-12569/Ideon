import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ClientOnly,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
import { SparkCursor } from "@/components/SparkCursor";
import { Toaster } from "@/components/ui/sonner";
import { Web3Provider } from "@/components/Web3Provider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold">Idea not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The thought you're chasing doesn't exist — or it migrated.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-neon px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Something sparked the wrong way
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-neon px-6 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium hover:bg-white/5"
          >
            Home
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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#09090B" },
      { title: "Ideon — Think it. List it. Pump it." },
      {
        name: "description",
        content:
          "Ideon turns shower thoughts into tradable tokens. Mint your idea, watch it pump on a bonding curve, and migrate to Uniswap on Base.",
      },
      { name: "author", content: "Ideon" },
      { property: "og:title", content: "Ideon — Think it. List it. Pump it." },
      {
        property: "og:description",
        content: "Mint your startup idea as a token. Trade ideas on Base.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly fallback={<AppShell />}>
        <Web3Provider>
          <AppShell />
        </Web3Provider>
      </ClientOnly>
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  );
}

function AppShell() {
  return (
    <>
      <NeuralBackground />
      <SparkCursor />
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
    </>
  );
}
