import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { ArrowLeft, Copy, Instagram, Twitter, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/idea/$id")({
  loader: ({ params }) => {
    const idea = MOCK_IDEAS[params.id];
    if (!idea) throw notFound();
    return idea;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `$${loaderData.ticker} · ${loaderData.title} — Ideon` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `$${loaderData.ticker} · ${loaderData.title}` },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Idea — Ideon" }],
  }),
  component: IdeaDetailPage,
});

type IdeaDetail = {
  id: string;
  title: string;
  ticker: string;
  description: string;
  creator: string;
  twitter?: string;
  instagram?: string;
  hue: number;
  marketCap: number;
  priceEth: number;
  holders: number;
  supply: number;
  progress: number;
  history: { t: number; p: number }[];
};

const MOCK_IDEAS: Record<string, IdeaDetail> = Object.fromEntries(
  Array.from({ length: 12 }).map((_, i) => {
    const id = String(i + 1);
    const titles = ["Shower OS", "PostMail", "GymGPT", "FridgeDAO", "DreamFi", "PetSwap", "TaxiPump", "Hourly", "Nibble", "Lurk", "Rebound", "Caffeine"];
    const tickers = ["SHWR", "PMAIL", "GMGP", "FDGE", "DREAM", "PETS", "TXPM", "HRLY", "NBL", "LURK", "RBND", "CAF"];
    const history = Array.from({ length: 60 }).map((_, k) => ({
      t: k,
      p: 0.0001 + Math.sin(k * 0.18 + i) * 0.00004 + k * 0.0000035 + Math.random() * 0.000008,
    }));
    return [
      id,
      {
        id,
        title: titles[i],
        ticker: tickers[i],
        description:
          "A market-changing idea that nobody asked for, but everybody needed. Built by a degen with a vision and zero plan. Don't trust, verify (the vibes).",
        creator: "0x1A2b3C4d5E6f7890aBcDeF0123456789AbCdEf01",
        twitter: "https://x.com/lovable_dev",
        instagram: "https://instagram.com",
        hue: i % 2 === 0 ? 215 : 200,
        marketCap: Math.round(2400 + Math.random() * 92000),
        priceEth: history[history.length - 1].p,
        holders: 12 + i * 7,
        supply: 1_000_000_000,
        progress: Math.min(98, 10 + i * 7),
        history,
      } satisfies IdeaDetail,
    ];
  }),
);

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function IdeaDetailPage() {
  const idea = Route.useLoaderData();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");

  const estimated = useMemo(() => {
    const n = parseFloat(amount);
    if (!n || isNaN(n)) return "0";
    return side === "buy"
      ? (n / idea.priceEth).toLocaleString(undefined, { maximumFractionDigits: 0 })
      : (n * idea.priceEth).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [amount, side, idea.priceEth]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <Link
        to="/explore"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All markets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* LEFT — info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl font-display text-3xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(${idea.hue} 90% 60%), hsl(${
                    (idea.hue + 60) % 360
                  } 90% 60%))`,
                }}
              >
                {idea.ticker[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display italic text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1] tracking-tight text-chrome animate-chrome">
                  {idea.title}
                </h1>
                <p className="mt-1 font-mono text-sm uppercase tracking-wider text-[var(--neon-blue)]">
                  ${idea.ticker}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-foreground/80 sm:text-base">
              {idea.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Market cap" value={`$${idea.marketCap.toLocaleString()}`} />
              <Stat label="Price" value={`${idea.priceEth.toFixed(8)} Ξ`} />
              <Stat label="Holders" value={idea.holders.toLocaleString()} />
              <Stat label="Supply" value={`${(idea.supply / 1_000_000).toFixed(0)}M`} />
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Creator
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(idea.creator);
                  toast.success("Address copied");
                }}
                className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs hover:text-white"
              >
                {shorten(idea.creator)}
                <Copy className="h-3.5 w-3.5" />
              </button>
              {idea.twitter && (
                <a
                  href={idea.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="glass inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-white"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {idea.instagram && (
                <a
                  href={idea.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="glass inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* RIGHT — action */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Price
              </h2>
              <span className="font-mono text-xs text-muted-foreground">last 60 trades</span>
            </div>
            <PriceChart data={idea.history} hue={idea.hue} />
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Migration progress
            </h2>
            <div className="flex items-end justify-between font-mono text-xs">
              <span className="text-muted-foreground">{idea.progress}% to Uniswap</span>
              <span className="text-[var(--neon-cyan)]">target 16 Ξ</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${idea.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-neon"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="glass mb-4 flex gap-1 rounded-full p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={cn(
                    "flex-1 rounded-full py-2 text-sm font-semibold uppercase tracking-wider transition-all",
                    side === s
                      ? s === "buy"
                        ? "bg-gradient-neon text-white shadow-[0_0_18px_-2px_color-mix(in_oklab,var(--neon-cyan)_60%,transparent)]"
                        : "bg-[var(--destructive)] text-white"
                      : "text-muted-foreground hover:text-white",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {side === "buy" ? "ETH amount" : `$${idea.ticker} amount`}
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 font-mono text-2xl tracking-tight focus:border-[var(--neon-cyan)]/60 focus:outline-none"
            />

            <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 text-sm">
              <span className="text-muted-foreground">You receive</span>
              <span className="font-mono">
                {estimated} {side === "buy" ? `$${idea.ticker}` : "Ξ"}
              </span>
            </div>

            <NeonButton
              size="lg"
              className="mt-4 w-full"
              variant={side === "buy" ? "primary" : "secondary"}
              onClick={() => toast.info("Connect a wallet to trade (V1 preview)")}
            >
              <Wallet className="h-4 w-4" />
              {side === "buy" ? `Buy $${idea.ticker}` : `Sell $${idea.ticker}`}
            </NeonButton>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function PriceChart({ data, hue }: { data: { t: number; p: number }[]; hue: number }) {
  const w = 600;
  const h = 200;
  const ps = data.map((d) => d.p);
  const min = Math.min(...ps);
  const max = Math.max(...ps);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data
    .map((d, i) => `${i * stepX},${h - ((d.p - min) / range) * h}`)
    .join(" ");
  const id = `pc-${hue}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 95% 70%)`} stopOpacity="0.55" />
          <stop offset="100%" stopColor={`hsl(${hue} 95% 70%)`} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={`hsl(${hue} 95% 78%)`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
