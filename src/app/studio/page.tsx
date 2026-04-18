"use client";

import { useState, useCallback, useEffect, Suspense, lazy, useMemo, memo } from "react";
import Link from "next/link";
import BrandLogo from "../components/BrandLogo";
import logoData from "../metadata.json";

const SVG3D = lazy(() => import("3dsvg").then((m) => ({ default: m.SVG3D })));

interface Asset { type: string; format: string; path: string; }
interface Brand { brand_name: string; category: string; tags: string[]; assets: Asset[]; }
const data = logoData as Record<string, Brand>;

const MATERIALS = ["default","plastic","metal","glass","rubber","chrome","gold","clay","emissive","holographic"];
const ANIMATIONS = ["none","spin","float","pulse","wobble","spinFloat","swing"];
const BGCOLORS = ["#0a0a0a","#ffffff","#e94560","#1a1a2e","#0f3460","#16213e","#ff6b81","#00d9ff","#ffaa00","transparent"];

const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="#e94560"/><text x="50" y="68" font-family="Arial,sans-serif" font-size="60" font-weight="900" fill="white" text-anchor="middle">L</text></svg>`;

function getFullUrl(path: string) {
  return `https://openmarks.vercel.app/assets/${path.replace(/^Assets\//, "")}`;
}

// Debounce hook for sliders
function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: 150) {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => fn(...args), delay);
    setTimer(t);
  }, [fn, timer, delay]);
}

export default function OpenMarksStudio() {
  const brands = useMemo(() => Object.entries(data), []);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [customSvg, setCustomSvg] = useState<string>("");
  const [search, setSearch] = useState("");

  const [depth, setDepth] = useState(0.8);
  const [smoothness, setSmoothness] = useState(0.35);
  const [color, setColor] = useState("#e94560");
  const [material, setMaterial] = useState("plastic");
  const [metalness, setMetalness] = useState(0.2);
  const [roughness, setRoughness] = useState(0.35);
  const [bgColor, setBgColor] = useState("#0a0a0a");
  const [animate, setAnimate] = useState("spin");
  const [animateSpeed, setAnimateSpeed] = useState(1.2);
  const [zoom, setZoom] = useState(5);
  const [fov, setFov] = useState(40);
  const [rotationX, setRotationX] = useState(-0.3);
  const [rotationY, setRotationY] = useState(0.4);
  const [lightIntensity, setLightIntensity] = useState(2.5);
  const [ambientIntensity, setAmbientIntensity] = useState(0.6);
  const [shadow, setShadow] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [resetOnIdle, setResetOnIdle] = useState(false);
  const [resetDelay, setResetDelay] = useState(3);
  const [intro, setIntro] = useState<"zoom" | "fade" | "none">("zoom");
  const [textureUrl, setTextureUrl] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const brand = selectedKey ? data[selectedKey] : null;
  const mainAsset = brand
    ? (brand.assets.find((a) => a.type === "icon") || brand.assets.find((a) => a.type === "default") || brand.assets[0])
    : null;
  const svgUrl = mainAsset ? getFullUrl(mainAsset.path) : "";

  const [svgString, setSvgString] = useState(DEMO_SVG);
  const [svgLoading, setSvgLoading] = useState(false);

  useEffect(() => {
    if (customSvg) {
      fetch(customSvg).then(r => r.text()).then(t => setSvgString(t));
      return;
    }
    if (!svgUrl) {
      if (!selectedKey) setSvgString(DEMO_SVG);
      return;
    }
    setSvgLoading(true);
    fetch(svgUrl)
      .then((r) => r.text())
      .then((t) => { setSvgString(t); setSvgLoading(false); })
      .catch(() => { setSvgString(DEMO_SVG); setSvgLoading(false); });
  }, [svgUrl, customSvg, selectedKey]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomSvg(ev.target?.result as string);
      setSelectedKey(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleReset = () => {
    setDepth(0.8); setSmoothness(0.35); setColor("#e94560"); setMaterial("plastic");
    setMetalness(0.2); setRoughness(0.35); setBgColor("#0a0a0a"); setAnimate("spin");
    setAnimateSpeed(1.2); setZoom(5); setFov(40); setRotationX(-0.3); setRotationY(0.4);
    setLightIntensity(2.5); setAmbientIntensity(0.6); setShadow(true); setWireframe(false);
    setResetOnIdle(false); setResetDelay(3); setIntro("zoom"); setTextureUrl("");
    setResetKey((k) => k + 1);
  };

  const filtered = useMemo(() =>
    brands.filter(([key, b]) =>
      !search || key.includes(search.toLowerCase()) || b.brand_name.toLowerCase().includes(search.toLowerCase())
    ), [brands, search]);

  // Memoize 3D props to avoid re-renders on every slider tick
  const svg3dProps = useMemo(() => ({
    svg: svgString,
    depth,
    smoothness,
    color,
    material: material as any,
    metalness,
    roughness,
    wireframe,
    animate: animate as any,
    animateSpeed,
    zoom,
    fov,
    rotationX,
    rotationY,
    lightIntensity,
    ambientIntensity,
    shadow,
    background: bgColor,
    resetOnIdle,
    resetDelay,
    intro,
    texture: textureUrl || undefined,
    resetKey,
    width: "100%",
    height: "100%",
    interactive: true,
    cursorOrbit: true,
    draggable: true,
    lightPosition: [8, 12, 8] as [number, number, number],
  }), [svgString, depth, smoothness, color, material, metalness, roughness, wireframe, animate, animateSpeed, zoom, fov, rotationX, rotationY, lightIntensity, ambientIntensity, shadow, bgColor, resetOnIdle, resetDelay, intro, textureUrl, resetKey]);

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium hover:text-neutral-300 transition-colors flex items-center gap-1">← <BrandLogo firstWord="open" secondWord="marks" size="sm" /></Link>
          <span className="text-white/20">|</span>
          <span className="text-sm font-semibold">3D Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">
            Upload SVG
            <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={handleReset} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-colors">Reset All</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Controls */}
        <aside className="w-72 border-r border-white/10 overflow-y-auto p-4 space-y-5 shrink-0">
          <div>
            <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Library Logo</label>
            <input type="text" placeholder="Search logo..." className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-white/30 mb-2 placeholder:text-neutral-600" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
              {filtered.slice(0, 40).map(([key, b]) => {
                const a = b.assets.find((x) => x.type === "icon") || b.assets.find((x) => x.type === "default") || b.assets[0];
                const src = `/assets/${a.path.replace(/^Assets\//, "")}`;
                return (
                  <button key={key} onClick={() => { setSelectedKey(key); setCustomSvg(""); }}
                    className={`aspect-square bg-white rounded flex items-center justify-center p-1 transition-all ${selectedKey === key ? "ring-2 ring-white scale-105" : "opacity-70 hover:opacity-100"}`}>
                    <img src={src} alt={b.brand_name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  </button>
                );
              })}
            </div>
          </div>

          <ControlGroup title="Shape">
            <Slider label="Depth" value={depth} min={0.1} max={3} step={0.1} onChange={setDepth} />
            <Slider label="Smoothness" value={smoothness} min={0} max={1} step={0.05} onChange={setSmoothness} />
          </ControlGroup>

          <ControlGroup title="Material">
            <div className="grid grid-cols-5 gap-1">
              {MATERIALS.map((m) => (
                <button key={m} onClick={() => setMaterial(m)} className={`px-1 py-1 text-[9px] rounded border transition-colors ${material === m ? "bg-white text-black border-white" : "border-white/10 text-neutral-400 hover:border-white/30"}`}>{m}</button>
              ))}
            </div>
            <ColorPicker label="Tint" value={color} onChange={setColor} />
            <Slider label="Metalness" value={metalness} min={0} max={1} step={0.05} onChange={setMetalness} />
            <Slider label="Roughness" value={roughness} min={0} max={1} step={0.05} onChange={setRoughness} />
            <label className="flex items-center gap-2 text-xs text-neutral-400 mt-1 cursor-pointer">
              <input type="checkbox" checked={wireframe} onChange={(e) => setWireframe(e.target.checked)} className="accent-white" /> Wireframe
            </label>
          </ControlGroup>

          <ControlGroup title="Animation">
            <div className="flex flex-wrap gap-1">
              {ANIMATIONS.map((a) => (
                <button key={a} onClick={() => setAnimate(a)} className={`px-2 py-1 text-[10px] rounded border transition-colors ${animate === a ? "bg-white text-black border-white" : "border-white/10 text-neutral-400 hover:border-white/30"}`}>{a}</button>
              ))}
            </div>
            <Slider label="Speed" value={animateSpeed} min={0.1} max={3} step={0.1} onChange={setAnimateSpeed} />
          </ControlGroup>

          <ControlGroup title="Camera">
            <Slider label="Zoom" value={zoom} min={1} max={15} step={0.5} onChange={setZoom} />
            <Slider label="FOV" value={fov} min={10} max={100} step={1} onChange={setFov} />
            <Slider label="Tilt X" value={rotationX} min={-1} max={1} step={0.05} onChange={setRotationX} />
            <Slider label="Tilt Y" value={rotationY} min={-1} max={1} step={0.05} onChange={setRotationY} />
            <label className="flex items-center gap-2 text-xs text-neutral-400 mt-1 cursor-pointer">
              <input type="checkbox" checked={resetOnIdle} onChange={(e) => setResetOnIdle(e.target.checked)} className="accent-white" /> Reset on idle
            </label>
            {resetOnIdle && <Slider label="Reset Delay (s)" value={resetDelay} min={1} max={10} step={0.5} onChange={setResetDelay} />}
          </ControlGroup>

          <ControlGroup title="Lighting">
            <Slider label="Key Light" value={lightIntensity} min={0} max={5} step={0.1} onChange={setLightIntensity} />
            <Slider label="Ambient" value={ambientIntensity} min={0} max={2} step={0.1} onChange={setAmbientIntensity} />
            <label className="flex items-center gap-2 text-xs text-neutral-400 mt-1 cursor-pointer">
              <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="accent-white" /> Shadows
            </label>
          </ControlGroup>

          <ControlGroup title="Background">
            <div className="flex flex-wrap gap-1.5">
              {BGCOLORS.map((c) => (
                <button key={c} onClick={() => setBgColor(c)} className={`w-6 h-6 rounded-full border transition-all ${bgColor === c ? "ring-2 ring-white scale-110" : "border-white/20 hover:border-white/40"}`} style={{ background: c }} />
              ))}
            </div>
          </ControlGroup>

          <ControlGroup title="Intro">
            <div className="flex gap-1">
              {(["zoom","fade","none"] as const).map((i) => (
                <button key={i} onClick={() => setIntro(i)} className={`px-2 py-1 text-[10px] rounded border transition-colors ${intro === i ? "bg-white text-black border-white" : "border-white/10 text-neutral-400 hover:border-white/30"}`}>{i}</button>
              ))}
            </div>
          </ControlGroup>

          <ControlGroup title="Texture">
            <input type="text" placeholder="Image URL..." className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-white/30 placeholder:text-neutral-600" value={textureUrl} onChange={(e) => setTextureUrl(e.target.value)} />
          </ControlGroup>
        </aside>

        {/* Center: 3D Canvas */}
        <main className="flex-1 relative">
          <div className="w-full h-full" style={{ background: bgColor }}>
            {svgString ? (
              <Suspense fallback={<CanvasFallback text="Loading 3D engine…" />}>
                <SVG3D {...svg3dProps} />
              </Suspense>
            ) : (
              <CanvasFallback text={svgLoading ? "Loading SVG…" : "Select a logo or upload an SVG"} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CanvasFallback({ text }: { text: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-3">
      <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/10 pb-4 last:border-0">
      <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );
}

const Slider = memo(function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
    </div>
  );
});

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] text-neutral-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500 font-mono">{value}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer" />
      </div>
    </div>
  );
}
