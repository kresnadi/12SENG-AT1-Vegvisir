"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import type { Mode } from "@/lib/modes";

export default function StreetView({ src, mode }: { src: string; mode: Mode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hard = mode === "hard";
    const viewer = new Viewer({
      container: ref.current!,
      panorama: src,
      navbar: false,
      defaultYaw: Math.random() * Math.PI * 2,
      defaultPitch: 0,
      minFov: hard ? 45 : 30,
      maxFov: hard ? 45 : 90,
      mousewheel: !hard,
      mousemove: !hard,
    });
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const p = viewer.getPosition();
      viewer.rotate({ yaw: p.yaw + (t - last) * 0.0004, pitch: p.pitch });
      last = t;
      raf = requestAnimationFrame(tick);
    };
    if (hard) {
      viewer.addEventListener("ready", () => {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      });
    }
    return () => {
      cancelAnimationFrame(raf);
      viewer.destroy();
    };
  }, [src, mode]);

  return <div ref={ref} className="w-screen h-screen" />;
}
