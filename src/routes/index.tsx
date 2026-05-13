import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { NeonButton } from "@/components/NeonButton";
import { ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ideon — Think it. List it. Pump it." },
      {
        name: "description",
        content:
          "Mint your startup idea as a tradable token on Base. Bonding-curve discovery, then migration to Uniswap.",
      },
      { property: "og:title", content: "Ideon — Think it. List it. Pump it." },
      {
        property: "og:description",
        content: "The decentralized idea pump. Built on Base.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <section className="relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass mb-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground/80"
      >
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--neon-blue)] opacity-75" />
          <span className="relative inline-block h-2 w-2 rounded-full bg-[var(--neon-blue)]" />
        </span>
        Live on Base Sepolia
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.05 }}
        className="font-display text-[clamp(5rem,18vw,14rem)] font-semibold leading-[0.9] tracking-tight text-chrome animate-chrome animate-text-shimmer italic"
      >
        Ideon
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.18 }}
        className="mt-4 font-display text-[clamp(1.4rem,4vw,2.5rem)] font-medium tracking-wide text-foreground/90"
      >
        Think it. List it. Pump it.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.32 }}
        className="mt-6 max-w-xl text-sm text-muted-foreground sm:text-base"
      >
        A blazing-fast, decentralized market for shower thoughts. Mint your idea
        as a token and let degens trade conviction before a single line of code
        is written.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
      >
        <Link to="/launch" className="w-full sm:w-auto">
          <NeonButton size="lg" pulse className="w-full sm:w-auto">
            Launch an Idea
            <ArrowUpRight className="h-4 w-4" />
          </NeonButton>
        </Link>
        <Link to="/explore" className="w-full sm:w-auto">
          <NeonButton size="lg" variant="secondary" className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Explore Markets
          </NeonButton>
        </Link>
      </motion.div>

      {/* Decorative orb behind title */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-neon-soft)" }}
      />
    </section>
  );
}
