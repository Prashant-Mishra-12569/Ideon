import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { z } from "zod";

import { NeonButton } from "@/components/NeonButton";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Rocket, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/launch")({
  head: () => ({
    meta: [
      { title: "Launch an Idea — Ideon" },
      {
        name: "description",
        content:
          "Mint your startup idea as a tradable token on Base Sepolia. Title it, ticker it, drop a logo. Pump it.",
      },
      { property: "og:title", content: "Launch an Idea — Ideon" },
      { property: "og:description", content: "Mint shower thoughts as tokens on Base." },
    ],
  }),
  component: LaunchPage,
});

const ideaSchema = z.object({
  title: z.string().trim().min(2, "Min 2 chars").max(60, "Max 60 chars"),
  ticker: z
    .string()
    .trim()
    .min(3, "Min 3 chars")
    .max(8, "Max 8 chars")
    .regex(/^[A-Z0-9]+$/i, "Letters/numbers only"),
  description: z.string().trim().min(20, "Min 20 chars").max(500, "Max 500 chars"),
  twitter: z
    .string()
    .trim()
    .url("Invalid URL")
    .max(200)
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .trim()
    .url("Invalid URL")
    .max(200)
    .optional()
    .or(z.literal("")),
});
type IdeaForm = z.infer<typeof ideaSchema>;

function LaunchPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<IdeaForm>({
    title: "",
    ticker: "",
    description: "",
    twitter: "",
    instagram: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IdeaForm, string>>>({});
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Logo too large", { description: "Max 2 MB." });
      return;
    }
    setLogo(f);
    setLogoPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] },
    multiple: false,
    maxFiles: 1,
  });

  const set = <K extends keyof IdeaForm>(k: K, v: IdeaForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = ideaSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Partial<Record<keyof IdeaForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof IdeaForm;
        if (!errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      toast.error("Fix the form errors");
      return;
    }
    if (!logo) {
      toast.error("Add a logo for your idea");
      return;
    }
    setErrors({});
    setSubmitting(true);

    // V1 stub: simulates Pinata upload + on-chain mint. Wire to real flow when contracts deployed + PINATA_JWT set.
    try {
      await new Promise((r) => setTimeout(r, 1200));
      toast.success("Idea minted (preview)", {
        description: "Hook up Pinata + factory contract to go live.",
      });
      navigate({ to: "/explore" });
    } catch (err) {
      toast.error("Mint failed", { description: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="glass mx-auto mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-foreground/80">
          <Rocket className="h-3.5 w-3.5 text-[var(--neon-blue)]" />
          New listing
        </div>
        <h1 className="font-display italic text-[clamp(2.75rem,8vw,5rem)] font-semibold leading-[0.95] tracking-tight text-chrome animate-chrome">
          Mint your idea
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          From thought to token in under a minute.
        </p>
      </motion.header>

      <div className="p-0 sm:p-2">
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Idea title" error={errors.title}>
              <input
                type="text"
                placeholder="A decentralized shower thought marketplace"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputCls}
                maxLength={60}
              />
            </Field>
            <Field label="Token ticker" error={errors.ticker}>
              <div className="relative">
                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  placeholder="THINK"
                  value={form.ticker}
                  onChange={(e) => set("ticker", e.target.value.toUpperCase())}
                  className={cn(inputCls, "pl-5 font-mono uppercase tracking-wider")}
                  maxLength={8}
                />
              </div>
            </Field>
          </div>

          <Field label="Description" error={errors.description}>
            <textarea
              rows={3}
              placeholder="Mint your idea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={cn(inputCls, "min-h-[100px] resize-y")}
              maxLength={500}
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {form.description.length} / 500
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="X (Twitter)" optional error={errors.twitter}>
              <input
                type="url"
                placeholder="Input (optional)"
                value={form.twitter}
                onChange={(e) => set("twitter", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Instagram" optional error={errors.instagram}>
              <input
                type="url"
                placeholder="Input (optional)"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Logo">
            <div
              {...getRootProps()}
              className={cn(
                "relative flex aspect-[3/1] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.02] transition-all hover:border-[var(--neon-blue)]/60 hover:bg-white/[0.04]",
                isDragActive && "border-[var(--neon-blue)] bg-[color-mix(in_oklab,var(--neon-blue)_8%,transparent)]",
              )}
            >
              <input {...getInputProps()} />
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogo(null);
                      setLogoPreview(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white/80 hover:text-white"
                    aria-label="Remove logo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <ImageIcon className="h-6 w-6 text-[var(--neon-blue)]" />
                  <p className="text-sm font-medium">
                    {isDragActive ? "Drop the logo" : "Drag & drop, or click"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG / JPG / SVG · max 2 MB</p>
                </div>
              )}
            </div>
          </Field>

          <div className="flex justify-center pt-4">
            <NeonButton type="submit" size="lg" disabled={submitting} pulse className="min-w-[220px]">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Launch
                </>
              )}
            </NeonButton>
          </div>
        </form>
      </div>
    </section>
  );
}

const inputCls = "underline-input w-full text-sm text-foreground placeholder:text-muted-foreground/60";


function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {optional && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] normal-case tracking-normal">
            optional
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-[var(--destructive)]">{error}</p>}
    </div>
  );
}
