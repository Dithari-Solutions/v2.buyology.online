"use client";

import { useEffect, useRef } from "react";
import { regions } from "@/lib/regions";

type Marker = { id: string; x: number; y: number; front: boolean };

/** Dependency-free 3D globe: a rotating dotted sphere with region markers. */
export function Globe({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeId);
  const onSelectRef = useRef(onSelect);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tilt = 0.35;
    let rot = -0.9;
    let raf = 0;

    // Dotted sphere
    const dots: { x: number; y: number; z: number }[] = [];
    const LAT = 32;
    for (let i = 0; i <= LAT; i++) {
      const theta = (Math.PI * i) / LAT;
      const y = Math.cos(theta);
      const r = Math.sin(theta);
      const count = Math.max(6, Math.round(38 * r));
      for (let j = 0; j < count; j++) {
        const phi = (2 * Math.PI * j) / count;
        dots.push({ x: r * Math.cos(phi), y, z: r * Math.sin(phi) });
      }
    }

    // Region markers (lat/lng → unit sphere)
    const pts = regions.map((rg) => {
      const la = (rg.lat * Math.PI) / 180;
      const lo = (rg.lng * Math.PI) / 180;
      return {
        id: rg.id,
        x: Math.cos(la) * Math.sin(lo),
        y: Math.sin(la),
        z: Math.cos(la) * Math.cos(lo),
      };
    });

    // Graticule — meridians + parallels give the globe its visible "wire" lines.
    const d2r = Math.PI / 180;
    const onSphere = (la: number, lo: number) => ({
      x: Math.cos(la * d2r) * Math.sin(lo * d2r),
      y: Math.sin(la * d2r),
      z: Math.cos(la * d2r) * Math.cos(lo * d2r),
    });
    type Line = { pts: { x: number; y: number; z: number }[]; bold: boolean };
    const graticule: Line[] = [];
    for (let lo = 0; lo < 360; lo += 30) {
      const pline = [];
      for (let la = -88; la <= 88; la += 5) pline.push(onSphere(la, lo));
      graticule.push({ pts: pline, bold: lo === 0 || lo === 180 });
    }
    for (const la of [-60, -30, 0, 30, 60]) {
      const pline = [];
      for (let lo = 0; lo <= 360; lo += 5) pline.push(onSphere(la, lo));
      graticule.push({ pts: pline, bold: la === 0 });
    }

    function project(px: number, py: number, pz: number) {
      const ca = Math.cos(rot);
      const sa = Math.sin(rot);
      const x = px * ca + pz * sa;
      const z0 = -px * sa + pz * ca;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const y = py * ct - z0 * st;
      const z = py * st + z0 * ct;
      return { x, y, z };
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = canvas!.clientWidth || 360;
      canvas!.width = size * dpr;
      canvas!.height = size * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    function draw() {
      const w = canvas!.clientWidth || 360;
      const cx = w / 2;
      const cy = w / 2;
      const R = w / 2 - 10;
      ctx!.clearRect(0, 0, w, w);

      // ambient glow
      const glow = ctx!.createRadialGradient(cx, cy, R * 0.35, cx, cy, R * 1.15);
      glow.addColorStop(0, "rgba(140,110,240,0.18)");
      glow.addColorStop(1, "rgba(140,110,240,0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
      ctx!.fill();

      // sphere fill
      ctx!.fillStyle = "rgba(46,16,101,0.55)";
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();

      // dots
      for (const d of dots) {
        const p = project(d.x, d.y, d.z);
        const sx = cx + p.x * R;
        const sy = cy - p.y * R;
        const front = p.z > 0;
        const depth = (p.z + 1) / 2;
        ctx!.beginPath();
        ctx!.arc(sx, sy, front ? 1.15 : 0.7, 0, Math.PI * 2);
        ctx!.fillStyle = front
          ? `rgba(199,183,255,${0.25 + 0.55 * depth})`
          : "rgba(160,140,230,0.08)";
        ctx!.fill();
      }

      // graticule (front-facing arcs only)
      for (const g of graticule) {
        ctx!.beginPath();
        let drawing = false;
        for (const pt of g.pts) {
          const p = project(pt.x, pt.y, pt.z);
          if (p.z > 0.02) {
            const sx = cx + p.x * R;
            const sy = cy - p.y * R;
            if (!drawing) {
              ctx!.moveTo(sx, sy);
              drawing = true;
            } else {
              ctx!.lineTo(sx, sy);
            }
          } else {
            drawing = false;
          }
        }
        ctx!.lineWidth = g.bold ? 1.1 : 0.8;
        ctx!.strokeStyle = g.bold
          ? "rgba(214,199,255,0.42)"
          : "rgba(188,168,252,0.22)";
        ctx!.stroke();
      }

      // globe rim
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(214,199,255,0.28)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // markers
      const now = performance.now();
      const markers: Marker[] = [];
      for (const rp of pts) {
        const p = project(rp.x, rp.y, rp.z);
        const sx = cx + p.x * R;
        const sy = cy - p.y * R;
        const front = p.z > 0;
        markers.push({ id: rp.id, x: sx, y: sy, front });
        if (!front) continue;
        const active = rp.id === activeRef.current;
        const col = active ? "251,187,20" : "255,255,255";

        if (active && !reduce) {
          const t = (now % 1600) / 1600;
          ctx!.beginPath();
          ctx!.arc(sx, sy, 8 + t * 16, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(251,187,20,${0.5 * (1 - t)})`;
          ctx!.lineWidth = 1.5;
          ctx!.stroke();
        }
        ctx!.beginPath();
        ctx!.arc(sx, sy, active ? 9 : 5.5, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${col},${active ? 0.9 : 0.55})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(sx, sy, active ? 4.5 : 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${col},1)`;
        ctx!.fill();
      }
      markersRef.current = markers;

      if (!reduce) rot += 0.003;
      raf = requestAnimationFrame(draw);
    }
    draw();

    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best: string | null = null;
      let bd = 18;
      for (const m of markersRef.current) {
        if (!m.front) continue;
        const d = Math.hypot(mx - m.x, my - m.y);
        if (d < bd) {
          bd = d;
          best = m.id;
        }
      }
      if (best) onSelectRef.current(best);
    }
    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Buyology regions globe"
      className="mx-auto block aspect-square w-full max-w-[380px] cursor-pointer"
    />
  );
}
