import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Ideon" },
      { name: "description", content: "Your launched ideas and idea-token portfolio." },
      { property: "og:title", content: "My Profile — Ideon" },
      { property: "og:description", content: "Track ideas you launched and tokens you hold." },
    ],
  }),
  component: ProfilePage,
});

type Tab = "ideas" | "portfolio";

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("ideas");
  const connected = false;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="font-display italic text-[clamp(2.5rem,8vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-chrome animate-chrome">
          Digital Identity
        </h1>
      </motion.header>

      {/* Chrome identity card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10 overflow-hidden rounded-3xl border border-white/15"
        style={{
          background: "var(--gradient-chrome)",
          backgroundSize: "200% 200%",
          animation: "ideon-chrome-shift 8s ease-in-out infinite",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.4), 0 20px 60px -20px rgba(60,120,255,0.45)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.5),transparent_60%)] mix-blend-overlay" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-3 w-3">
              <span
                className={cn(
                  "absolute inset-0 animate-ping rounded-full opacity-70",
                  connected ? "bg-[var(--neon-blue)]" : "bg-white/40",
                )}
              />
              <span
                className={cn(
                  "relative h-3 w-3 rounded-full",
                  connected ? "bg-[var(--neon-blue)]" : "bg-white/60",
                )}
              />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/60">
                {connected ? "Connected" : "Not connected"}
              </p>
              <p className="font-mono text-sm text-black/80">
                {connected ? "0x1A2b…cdEf" : "Connect a wallet to continue"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/60">
              Balance
            </p>
            <p className="font-display text-3xl font-semibold text-black sm:text-4xl">
              {connected ? "0.42" : "0.000"} ETH
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 flex justify-center">
        <div className="glass inline-flex gap-1 rounded-full p-1">
          {(
            [
              { id: "ideas", label: "My Ideas" },
              { id: "portfolio", label: "My Portfolio" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                tab === t.id ? "text-white" : "text-foreground/70 hover:text-white",
              )}
            >
              {tab === t.id && (
                <span
                  className="absolute inset-0 -z-10 rounded-full"
                  style={{
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--neon-blue) 65%, transparent), color-mix(in oklab, var(--deep-blue) 55%, transparent))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                  }}
                />
              )}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Empty
        title={tab === "ideas" ? "Launch an Idea" : "No tokens held"}
        body={
          tab === "ideas"
            ? "Mint your first shower thought into a tradable token."
            : "Trade some ideas on the Explore page to fill your bag."
        }
        cta={tab === "ideas" ? "Launch an Idea" : "Explore Markets"}
        href={tab === "ideas" ? "/launch" : "/explore"}
        icon={tab === "ideas" ? <Plus className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      />
    </section>
  );
}

function Empty({
  title,
  body,
  cta,
  href,
  icon,
}: {
  title: string;
  body: string;
  cta: string;
  href: "/launch" | "/explore";
  icon: React.ReactNode;
}) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-[var(--neon-blue)]">
        {icon}
      </div>
      <h3 className="font-display italic text-3xl font-semibold text-chrome">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-6">
        <Link to={href}>
          <NeonButton size="md" pulse>{cta}</NeonButton>
        </Link>
      </div>
    </GlassCard>
  );
}
