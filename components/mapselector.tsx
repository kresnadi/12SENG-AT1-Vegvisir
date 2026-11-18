"use client";

import { useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import type { Pt } from "@/lib/geo";

const W = 720;
const H = 360;
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = world as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const land = geoPath(projection)(feature(w, w.objects.countries) as any) ?? "";

type View = { k: number; x: number; y: number };

const clamp = (v: View): View => ({
  k: v.k,
  x: Math.min(0, Math.max(W - W * v.k, v.x)),
  y: Math.min(0, Math.max(H - H * v.k, v.y)),
});

export default function MapsSelector({
  guess,
  answer,
  onGuess,
}: {
  guess: Pt | null;
  answer?: Pt | null;
  onGuess?: (p: Pt) => void;
}) {
  const [view, setView] = useState<View>({ k: 1, x: 0, y: 0 });
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);

  const zoomAt = (sx: number, sy: number, f: number) =>
    setView((v) => {
      const k = Math.min(14, Math.max(1, v.k * f));
      return clamp({ k, x: sx - ((sx - v.x) * k) / v.k, y: sy - ((sy - v.y) * k) / v.k });
    });

  const toSvg = (cx: number, cy: number) => {
    const r = svg.current!.getBoundingClientRect();
    return { sx: ((cx - r.left) / r.width) * W, sy: ((cy - r.top) / r.height) * H, scale: W / r.width };
  };

  const place = (m: Pt | null) => {
    if (!m) return null;
    const p = projection([m.lng, m.lat]);
    return p ? { x: p[0], y: p[1] } : null;
  };

  const g = place(guess);
  const a = place(answer ?? null);
  const stroke = 1.5 / view.k;

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full block touch-none bg-[#b9d3d6] cursor-crosshair"
        onWheel={(e) => {
          const { sx, sy } = toSvg(e.clientX, e.clientY);
          zoomAt(sx, sy, e.deltaY < 0 ? 1.25 : 0.8);
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const { scale } = toSvg(e.clientX, e.clientY);
          const dx = (e.clientX - d.x) * scale;
          const dy = (e.clientY - d.y) * scale;
          d.moved += Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y);
          d.x = e.clientX;
          d.y = e.clientY;
          setView((v) => clamp({ ...v, x: v.x + dx, y: v.y + dy }));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (!d || d.moved > 4 || !onGuess) return;
          const { sx, sy } = toSvg(e.clientX, e.clientY);
          const ll = projection.invert?.([(sx - view.x) / view.k, (sy - view.y) / view.k]);
          if (ll) onGuess({ lat: ll[1], lng: ll[0] });
        }}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          <path d={land} fill="#e8e4d3" stroke="#6b6a5c" strokeWidth={0.5 / view.k} />
          {g && a && <line x1={g.x} y1={g.y} x2={a.x} y2={a.y} stroke="#2b2b24" strokeWidth={stroke} strokeDasharray={`${4 / view.k} ${3 / view.k}`} />}
          {g && <circle cx={g.x} cy={g.y} r={6 / view.k} fill="#c0392b" stroke="#fff" strokeWidth={stroke} />}
          {a && <circle cx={a.x} cy={a.y} r={6 / view.k} fill="#2e7d4f" stroke="#fff" strokeWidth={stroke} />}
        </g>
      </svg>
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <button className="w-8 h-8 bg-[#e8e4d3] border border-[#2b2b24] text-lg leading-none" onClick={() => zoomAt(W / 2, H / 2, 1.5)}>+</button>
        <button className="w-8 h-8 bg-[#e8e4d3] border border-[#2b2b24] text-lg leading-none" onClick={() => zoomAt(W / 2, H / 2, 1 / 1.5)}>−</button>
      </div>
    </div>
  );
}
