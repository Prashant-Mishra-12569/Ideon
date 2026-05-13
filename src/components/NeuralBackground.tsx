import { useEffect, useRef } from "react";

/**
 * SilkBackground — flowing blue silk/aurora canvas.
 * Layered sine waves with blue gradients, slowly drifting.
 * Lightweight, SSR-safe, ~30fps. Lighter pass on mobile.
 */
export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const LAYERS = isMobile ? 4 : 6;

    function resize() {
      if (!canvas) return;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const layers = Array.from({ length: LAYERS }).map((_, i) => ({
      amp: 60 + i * 28,
      freq: 0.0018 + i * 0.0006,
      speed: 0.00012 + i * 0.00006,
      offset: Math.random() * 1000,
      hue: 215 + (i % 3) * 8,
      light: 55 + (i % 2) * 12,
      alpha: 0.06 + (i % 3) * 0.04,
      yBase: 0.25 + i * 0.1,
    }));

    let raf = 0;
    let last = 0;
    const targetFps = reduceMotion ? 0 : isMobile ? 24 : 32;
    const frameDur = targetFps > 0 ? 1000 / targetFps : Infinity;

    function draw(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Base radial wash
      const radial = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
      radial.addColorStop(0, "hsla(220, 80%, 18%, 0.55)");
      radial.addColorStop(1, "hsla(225, 60%, 6%, 0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);

      for (const L of layers) {
        const yBase = h * L.yBase;
        const grad = ctx.createLinearGradient(0, yBase - L.amp, 0, yBase + L.amp);
        grad.addColorStop(0, `hsla(${L.hue}, 95%, ${L.light}%, 0)`);
        grad.addColorStop(0.5, `hsla(${L.hue}, 95%, ${L.light}%, ${L.alpha})`);
        grad.addColorStop(1, `hsla(${L.hue}, 95%, ${L.light}%, 0)`);
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, h);
        const step = isMobile ? 24 : 14;
        for (let x = 0; x <= w + step; x += step) {
          const y =
            yBase +
            Math.sin(x * L.freq + t * L.speed + L.offset) * L.amp +
            Math.cos(x * L.freq * 0.5 + t * L.speed * 0.7) * L.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // crisp highlight stroke
        ctx.beginPath();
        for (let x = 0; x <= w + step; x += step) {
          const y =
            yBase +
            Math.sin(x * L.freq + t * L.speed + L.offset) * L.amp +
            Math.cos(x * L.freq * 0.5 + t * L.speed * 0.7) * L.amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${L.hue + 5}, 100%, 80%, ${L.alpha * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (document.visibilityState === "hidden") return;
      if (targetFps === 0) {
        draw(0);
        cancelAnimationFrame(raf);
        return;
      }
      if (t - last < frameDur) return;
      last = t;
      draw(t);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-90"
    />
  );
}
