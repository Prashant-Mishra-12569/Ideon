import { useEffect, useRef } from "react";

/**
 * Custom glowing cursor + short particle trail.
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export function SparkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarse || reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("spark-cursor");

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    function resize() {
      if (!canvas) return;
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number };
    const particles: P[] = [];
    let mouseX = -100;
    let mouseY = -100;
    let lastX = mouseX;
    let lastY = mouseY;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      const dist = Math.hypot(dx, dy);
      const count = Math.min(6, Math.floor(dist / 6));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: mouseX + (Math.random() - 0.5) * 4,
          y: mouseY + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.6 - dx * 0.04,
          vy: (Math.random() - 0.5) * 0.6 - dy * 0.04,
          life: 0,
          max: 26 + Math.random() * 18,
          hue: Math.random() < 0.5 ? 215 : 200,
        });
      }
      lastX = mouseX;
      lastY = mouseY;
    }
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      // Trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        const t = 1 - p.life / p.max;
        if (t <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${p.hue}, 95%, 75%, ${t * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * t + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cursor core
      const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 22);
      grad.addColorStop(0, "hsla(210, 100%, 88%, 0.95)");
      grad.addColorStop(0.4, "hsla(215, 100%, 70%, 0.55)");
      grad.addColorStop(1, "hsla(220, 100%, 60%, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("spark-cursor");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
    />
  );
}
