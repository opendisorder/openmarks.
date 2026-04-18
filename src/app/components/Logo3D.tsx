"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const SVG3D = dynamic(() => import("3dsvg").then((m) => ({ default: m.SVG3D })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
      <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
      Loading 3D engine…
    </div>
  ),
});

export default function Logo3D({ svgUrl, animate }: { svgUrl: string; animate: string }) {
  const [svgString, setSvgString] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setSvgString(null);

    fetch(svgUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        if (!text.trim().startsWith("<svg")) throw new Error("Not valid SVG");
        setSvgString(text);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("3D SVG load error:", err);
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [svgUrl]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
        <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
        Loading SVG…
      </div>
    );
  }

  if (error || !svgString) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-sm gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <p>Could not load 3D preview</p>
        <p className="text-[11px] text-neutral-600">This SVG may use paths that are not supported by the 3D extruder.</p>
      </div>
    );
  }

  return (
    <SVG3D
      svg={svgString}
      animate={animate as any}
      depth={0.4}
      color="#ffffff"
      material="glass"
      background="#111111"
      width="100%"
      height="100%"
      interactive={true}
      cursorOrbit={true}
      shadow={true}
    />
  );
}
