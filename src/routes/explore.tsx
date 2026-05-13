import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Markets — Ideon" },
      {
        name: "description",
        content: "Discover and trade the freshest startup ideas as tokens on Base Sepolia.",
      },
      { property: "og:title", content: "Explore Markets — Ideon" },
      { property: "og:description", content: "All ideas, live on Base." },
    ],
  }),
  component: ExplorePage,
});

type Idea = {
  id: string;
  title: string;
  ticker: string;
  marketCap: number;
  change24h: number;
  spark: number[];
  hue: number;
  progress: number;
};

const MOCK: Idea[] = Array.from({ length: 12 }).map((_, i) => {
  const seed = i + 1;
  const spark = Array.from({ length: 24 }).map(
    (_, k) => 50 + Math.sin(k * 0.6 + seed) * 18 + (k * (seed % 3 ? 1.4 : -0.6)) + Math.random() * 5,
  );
  return {
    id: String(seed),
    title: [
      "Shower OS",
      "PostMail",
      "GymGPT",
      "FridgeDAO",
      "DreamFi",
      "PetSwap",
      "TaxiPump",
      "Hourly",
      "Nibble",
      "Lurk",
      "Rebound",
      "Caffeine",
    ][i],
    ticker: ["SHWR", "PMAIL", "GMGP", "FDGE", "DREAM", "PETS", "TXPM", "HRLY", "NBL", "LURK", "RBND", "CAF"][i],
    marketCap: Math.round(2400 + Math.random() * 92000),
    change24h: (Math.random() * 60 - 20),
    spark,
    hue: i % 2 === 0 ? 215 : 200,
    progress: Math.min(98, Math.round(spark[spark.length - 1] / 1.3)),
  };
});

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "mcap", label: "Top Market Cap" },
  { id: "near", label: "Almost Migrated" },
] as const;

function ExplorePage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("new");

  const ideas = useMemo(() => {
    let list = MOCK.filter(
      (i) =>
        !q ||
        i.title.toLowerCase().includes(q.toLowerCase()) ||
        i.ticker.toLowerCase().includes(q.toLowerCase()),
    );
    if (sort === "mcap") list = [...list].sort((a, b) => b.marketCap - a.marketCap);
    if (sort === "near") list = [...list].sort((a, b) => b.progress - a.progress);
    return list;
  }, [q, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="font-display italic text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1] tracking-tight text-chrome animate-chrome">Markets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ideas.length} ideas live · Base Sepolia
          </p>
        </div>
        <Link to="/launch">
          <NeonButton size="md">
            <TrendingUp className="h-4 w-4" />
            Launch an Idea
          </NeonButton>
        </Link>
      </motion.header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="glass relative flex-1 rounded-full px-4 py-2.5">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker or name..."
            className="w-full bg-transparent pl-7 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            maxLength={40}
          />
        </div>
        <div className="glass flex gap-1 rounded-full p-1">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                sort === s.id
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ideas.map((i, idx) => (
          <IdeaCard key={i.id} idea={i} delay={idx * 0.03} />
        ))}
      </div>

      {ideas.length === 0 && (
        <div className="glass mt-8 rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">No ideas match "{q}".</p>
        </div>
      )}
    </section>
  );
}

function IdeaCard({ idea, delay }: { idea: Idea; delay: number }) {
  const up = idea.change24h >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
      style={{ transformPerspective: 800 }}
    >
      <Link to="/idea/$id" params={{ id: idea.id }}>
        <GlassCard className="group h-full p-5 hover:glow-mix">
          <div className="flex items-start gap-3">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white"
              style={{
                background: `linear-gradient(135deg, hsl(${idea.hue} 90% 60%), hsl(${
                  (idea.hue + 60) % 360
                } 90% 60%))`,
              }}
            >
              {idea.ticker[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold">{idea.title}</p>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                ${idea.ticker}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-mono",
                up
                  ? "bg-[color-mix(in_oklab,var(--neon-cyan)_18%,transparent)] text-[var(--neon-cyan)]"
                  : "bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] text-[var(--destructive)]",
              )}
            >
              {up ? "+" : ""}
              {idea.change24h.toFixed(1)}%
            </span>
          </div>

          <Sparkline data={idea.spark} hue={idea.hue} className="mt-4" />

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Market cap
              </p>
              <p className="font-mono text-base font-semibold">
                ${idea.marketCap.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Migration
              </p>
              <p className="font-mono text-sm">{idea.progress}%</p>
            </div>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-neon transition-all"
              style={{ width: `${idea.progress}%` }}
            />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function Sparkline({
  data,
  hue,
  className,
}: {
  data: number[];
  hue: number;
  className?: string;
}) {
  const w = 240;
  const h = 60;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * h}`)
    .join(" ");
  const id = `g-${hue}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 95% 70%)`} stopOpacity="0.5" />
          <stop offset="100%" stopColor={`hsl(${hue} 95% 70%)`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#${id})`}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={`hsl(${hue} 95% 75%)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
