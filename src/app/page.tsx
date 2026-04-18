"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import logoData from "./metadata.json";
import Logo3D from "./components/Logo3D";
import BrandLogo from "./components/BrandLogo";

interface Asset {
  type: string;
  format: string;
  path: string;
}

interface Brand {
  brand_name: string;
  category: string;
  tags: string[];
  assets: Asset[];
}

const CLOUDINARY_BASE = "https://res.cloudinary.com/dldf3xftp/image/upload";

function toCloudinaryUrl(localPath: string) {
  const clean = localPath.replace(/\\/g, "/").replace(/^Assets\//, "");
  return `${CLOUDINARY_BASE}/logo_library/${clean.replace(/\.[^.]+$/, "")}`;
}

function getFullUrl(path: string) {
  return `https://openmarks.vercel.app/assets/${path.replace(/^Assets\//, "")}`;
}

/* ── Toast ── */
function Toast({ message, show, onDone }: { message: string; show: boolean; onDone: () => void }) {
  useState(() => {
    if (show) setTimeout(onDone, 2200);
  });
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white text-black px-5 py-3 rounded-lg shadow-2xl text-sm font-medium flex items-center gap-2 animate-bounce-in">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
      {message}
    </div>
  );
}

/* ── 3D Preview ── */


export default function OpenMarks() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [animate3D, setAnimate3D] = useState("spin");

  const data = useMemo(() => logoData as Record<string, Brand>, []);

  const stats = useMemo(() => {
    const brands = Object.keys(data).length;
    const assets = Object.values(data).reduce((a, b) => a + b.assets.length, 0);
    const cats = new Set(Object.values(data).map((b) => b.category)).size;
    return { brands, assets, cats };
  }, [data]);

  const categories = useMemo<[string, number][]>(() => {
    const map = new Map<string, number>();
    Object.values(data).forEach((b) => {
      map.set(b.category, (map.get(b.category) || 0) + 1);
    });
    return [["All", stats.brands], ...Array.from(map.entries()).sort((a, b) => b[1] - a[1])];
  }, [data, stats.brands]);

  const filteredLogos = useMemo(() => {
    const term = search.toLowerCase().trim();
    return Object.entries(data).filter(([key, brand]) => {
      const matchesSearch =
        !term ||
        key.includes(term) ||
        brand.brand_name.toLowerCase().includes(term) ||
        brand.tags.some((t: string) => t.includes(term)) ||
        brand.category.toLowerCase().includes(term);
      const matchesCat = selectedCategory === "All" || brand.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory, data]);

  const handleCopy = useCallback((text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToastMsg(`${label} copied!`);
    setTimeout(() => { setCopiedKey((k) => (k === key ? null : k)); setToastMsg(""); }, 2200);
  }, []);

  const getLocalPath = useCallback((key: string, brand: Brand, asset?: Asset) => {
    const a = asset || brand.assets.find((x) => x.type === "icon") || brand.assets.find((x) => x.type === "default") || brand.assets[0];
    return `/assets/${a.path.replace(/^Assets\//, "")}`;
  }, []);

  const handleImgError = useCallback((src: string) => {
    setImgErrors((prev) => new Set(prev).add(src));
  }, []);

  const selectedBrandData = selectedBrand ? data[selectedBrand] : null;
  const mainAsset = selectedBrandData
    ? (selectedBrandData.assets.find((a) => a.type === "icon") || selectedBrandData.assets.find((a) => a.type === "default") || selectedBrandData.assets[0])
    : null;
  const mainSvgUrl = mainAsset ? getFullUrl(mainAsset.path) : "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo firstWord="open" secondWord="marks" size="sm" />
          </Link>
          <div className="flex items-center gap-6 text-sm text-neutral-400">
            <a href="#browse" className="hover:text-white transition-colors">Browse</a>
            <Link href="/studio" className="hover:text-white transition-colors">3D Studio</Link>
            <a href="https://github.com/ajmaliifthikar-ux/logo-library" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"><BrandLogo firstWord="open" secondWord="marks" size="lg" textColor="white" /><br /><span className="text-neutral-500">Brand Logo Library</span></h1>
          <p className="text-lg text-neutral-400 max-w-xl mb-10 leading-relaxed">{stats.brands.toLocaleString()}+ brand logos and UI icons. Searchable, categorized, and ready for production.</p>
          <div className="flex gap-12">
            {[{ label: "Brands", value: stats.brands }, { label: "Assets", value: stats.assets }, { label: "Categories", value: stats.cats }].map((s) => (
              <div key={s.label}><div className="text-3xl font-semibold text-white">{s.value.toLocaleString()}</div><div className="text-sm text-neutral-500 mt-0.5">{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section id="browse" className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <input type="text" placeholder="Search brands, tags, industries..." className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-neutral-500 text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-white/30 min-w-[200px] cursor-pointer text-neutral-300" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(([cat, count]) => <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat} ({count})</option>)}
          </select>
          <div className="flex border border-white/10 rounded-md overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2.5 ${viewMode === "grid" ? "bg-white text-black" : "bg-white/5 text-neutral-400 hover:text-white"}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2.5 ${viewMode === "list" ? "bg-white text-black" : "bg-white/5 text-neutral-400 hover:text-white"}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 text-sm">
          <span className="text-neutral-500">Showing <span className="text-white font-medium">{filteredLogos.length.toLocaleString()}</span> of {stats.brands.toLocaleString()}</span>
          {(search || selectedCategory !== "All") && <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="text-neutral-400 hover:text-white transition-colors">Clear filters</button>}
        </div>

        {filteredLogos.length === 0 && <div className="text-center py-24 border border-dashed border-white/10 rounded-lg"><p className="text-neutral-500 text-sm">No logos match your search.</p></div>}

        {viewMode === "grid" && filteredLogos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredLogos.map(([key, brand]) => {
              const src = getLocalPath(key, brand);
              const broken = imgErrors.has(src);
              return (
                <div key={key} onClick={() => setSelectedBrand(key)} className="group bg-[#111] rounded-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer flex flex-col overflow-hidden">
                  <div className="h-28 flex items-center justify-center p-5 relative bg-white rounded-t-lg">
                    {!broken ? <img src={src} alt={brand.brand_name} loading="lazy" onError={() => handleImgError(src)} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200" /> : <span className="text-neutral-300 text-xs">—</span>}
                  </div>
                  <div className="px-3 py-2.5">
                    <h3 className="text-sm font-medium text-white truncate">{brand.brand_name}</h3>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{brand.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "list" && filteredLogos.length > 0 && (
          <div className="space-y-2">
            {filteredLogos.map(([key, brand]) => {
              const src = getLocalPath(key, brand);
              const broken = imgErrors.has(src);
              return (
                <div key={key} onClick={() => setSelectedBrand(key)} className="flex items-center gap-4 bg-[#111] rounded-lg border border-white/10 hover:border-white/30 p-3 cursor-pointer transition-all">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded border border-neutral-200 shrink-0">
                    {!broken ? <img src={src} alt={brand.brand_name} loading="lazy" onError={() => handleImgError(src)} className="max-h-8 max-w-8 object-contain" /> : <span className="text-neutral-300 text-xs">—</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{brand.brand_name}</h3>
                    <p className="text-xs text-neutral-500 truncate">{brand.category} · {brand.assets.length} variant{brand.assets.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p><BrandLogo firstWord="open" secondWord="marks" size="sm" /> — Open Source</p>
          <p>Built by Mohamed Ajmal Ifthikar</p>
        </div>
      </footer>

      <Toast message={toastMsg} show={!!toastMsg} onDone={() => setToastMsg("")} />

      {/* Detail Modal */}
      {selectedBrandData && selectedBrand && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBrand(null)}>
          <div className="bg-[#111] border border-white/10 rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedBrandData.brand_name}</h2>
                <span className="inline-block mt-1 text-xs bg-white/10 text-neutral-300 px-2 py-1 rounded border border-white/10">{selectedBrandData.category}</span>
              </div>
              <button onClick={() => setSelectedBrand(null)} className="text-neutral-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Large Preview */}
              <div className="bg-white rounded-xl p-10 flex items-center justify-center">
                {mainAsset && !imgErrors.has(getLocalPath(selectedBrand, selectedBrandData, mainAsset)) ? (
                  <img src={getLocalPath(selectedBrand, selectedBrandData, mainAsset)} alt={selectedBrandData.brand_name} className="max-h-40 max-w-full object-contain" onError={() => handleImgError(getLocalPath(selectedBrand, selectedBrandData, mainAsset))} />
                ) : (
                  <span className="text-neutral-400 text-sm">Preview unavailable</span>
                )}
              </div>

              {/* 3D Preview */}
              {mainSvgUrl && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">3D Preview</h3>
                    <div className="flex gap-1">
                      {["spin", "float", "pulse", "none"].map((a) => (
                        <button key={a} onClick={() => setAnimate3D(a)} className={`px-2.5 py-1 text-[11px] rounded border ${animate3D === a ? "bg-white text-black border-white" : "bg-transparent text-neutral-400 border-white/20 hover:border-white/40"}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Logo3D svgUrl={mainSvgUrl} animate={animate3D} />
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedBrandData.tags.map((tag) => <span key={tag} className="text-[10px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full border border-white/5">{tag}</span>)}
              </div>

              {/* Assets with Copy + Attribution */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Assets</h3>
                {selectedBrandData.assets.map((asset) => {
                  const src = getLocalPath(selectedBrand, selectedBrandData, asset);
                  const cdnUrl = toCloudinaryUrl(asset.path);
                  const copyId = `${selectedBrand}-${asset.type}`;
                  const attribution = `<!-- ${selectedBrandData.brand_name} logo via openmarks. (https://openmarks.vercel.app) -->\n<img src="${cdnUrl}" alt="${selectedBrandData.brand_name}" />`;
                  return (
                    <div key={asset.type} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-neutral-200">
                      <div className="w-10 h-10 flex items-center justify-center bg-neutral-50 rounded border border-neutral-100 shrink-0">
                        <img src={src} alt={asset.type} className="max-h-6 max-w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black capitalize">{asset.type}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{asset.path}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(asset.path, copyId, "Path")} className={`px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors ${copiedKey === copyId ? "bg-green-600 text-white" : "bg-black text-white hover:bg-neutral-800"}`}>
                          {copiedKey === copyId ? "Copied" : "Path"}
                        </button>
                        <button onClick={() => handleCopy(cdnUrl, `${copyId}-cdn`, "CDN URL")} className={`px-2.5 py-1.5 text-[11px] font-medium rounded border transition-colors ${copiedKey === `${copyId}-cdn` ? "bg-green-600 text-white border-green-600" : "border-neutral-200 text-neutral-600 hover:border-black hover:text-black"}`}>
                          {copiedKey === `${copyId}-cdn` ? "Copied" : "CDN"}
                        </button>
                        <button onClick={() => handleCopy(attribution, `${copyId}-attr`, "Attribution")} className={`px-2.5 py-1.5 text-[11px] font-medium rounded border transition-colors ${copiedKey === `${copyId}-attr` ? "bg-green-600 text-white border-green-600" : "border-neutral-200 text-neutral-600 hover:border-black hover:text-black"}`}>
                          {copiedKey === `${copyId}-attr` ? "Copied" : "HTML"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Star & Share */}
              <div className="flex gap-3 pt-2">
                <a href="https://github.com/ajmaliifthikar-ux/logo-library" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Star on GitHub
                </a>
                <button onClick={() => handleCopy(`Check out openmarks. — ${stats.brands.toLocaleString()}+ brand logos & icons: https://openmarks.vercel.app`, "share", "Share text")} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  Share
                </button>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/10 text-[11px] text-neutral-400">
                Brand logos are trademarks of their respective owners. Please attribute when using commercially.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
