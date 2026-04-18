"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import logoData from "./metadata.json";

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

export default function LogoLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      const matchesCat =
        selectedCategory === "All" || brand.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory, data]);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  }, []);

  const getLocalPath = useCallback((key: string, brand: Brand, asset?: Asset) => {
    const cat = brand.category.replace(/ & /g, "_and_").replace(/ /g, "_");
    const a = asset || brand.assets.find((x) => x.type === "icon") || brand.assets.find((x) => x.type === "default") || brand.assets[0];
    const fname = a.path.split("/").pop()!;
    return `/assets/${cat}/${key}/${fname}`;
  }, []);

  const handleImgError = useCallback((src: string) => {
    setImgErrors((prev) => new Set(prev).add(src));
  }, []);

  const selectedBrandData = selectedBrand ? data[selectedBrand] : null;

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Navbar — clean monochrome */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">LogoLibrary</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#browse" className="hover:text-black transition-colors">Browse</a>
            <a href="https://github.com/ajmaliifthikar-ux/logo-library" target="_blank" rel="noreferrer" className="hover:text-black transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — Vercel-style monochrome */}
      <section className="border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
            Open Source<br />
            <span className="text-neutral-400">Brand Logo Library</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mb-10 leading-relaxed">
            {stats.brands.toLocaleString()}+ brand logos and UI icons. Searchable, categorized, and ready for production.
          </p>

          {/* Stats row */}
          <div className="flex gap-12">
            {[
              { label: "Brands", value: stats.brands },
              { label: "Assets", value: stats.assets },
              { label: "Categories", value: stats.cats },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-semibold text-black">{s.value.toLocaleString()}</div>
                <div className="text-sm text-neutral-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search + Controls */}
      <section id="browse" className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search brands, tags, industries..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-md px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-neutral-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            className="bg-white border border-neutral-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black min-w-[200px] cursor-pointer text-neutral-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(([cat, count]) => (
              <option key={cat} value={cat}>{cat} ({count})</option>
            ))}
          </select>
          <div className="flex border border-neutral-200 rounded-md overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-2.5 ${viewMode === "grid" ? "bg-black text-white" : "bg-white text-neutral-500 hover:text-black"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2.5 ${viewMode === "list" ? "bg-black text-white" : "bg-white text-neutral-500 hover:text-black"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <span className="text-neutral-400">
            Showing <span className="text-black font-medium">{filteredLogos.length.toLocaleString()}</span> of {stats.brands.toLocaleString()}
          </span>
          {(search || selectedCategory !== "All") && (
            <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="text-neutral-500 hover:text-black transition-colors">
              Clear filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredLogos.length === 0 && (
          <div className="text-center py-24 border border-dashed border-neutral-200 rounded-lg">
            <p className="text-neutral-400 text-sm">No logos match your search.</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredLogos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredLogos.map(([key, brand]) => {
              const src = getLocalPath(key, brand);
              const broken = imgErrors.has(src);
              return (
                <div
                  key={key}
                  onClick={() => setSelectedBrand(key)}
                  className="group bg-white rounded-lg border border-neutral-200 hover:border-black transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-24 flex items-center justify-center p-4 relative bg-neutral-50 rounded-t-lg">
                    {!broken ? (
                      <img
                        src={src}
                        alt={brand.brand_name}
                        loading="lazy"
                        onError={() => handleImgError(src)}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 [filter:invert(0)]"
                      />
                    ) : (
                      <span className="text-neutral-300 text-xs">—</span>
                    )}
                    {brand.assets.length > 1 && (
                      <span className="absolute top-2 right-2 text-[10px] bg-white text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200">
                        {brand.assets.length}
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2.5">
                    <h3 className="text-sm font-medium text-black truncate">{brand.brand_name}</h3>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{brand.category}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && filteredLogos.length > 0 && (
          <div className="space-y-2">
            {filteredLogos.map(([key, brand]) => {
              const src = getLocalPath(key, brand);
              const broken = imgErrors.has(src);
              return (
                <div
                  key={key}
                  onClick={() => setSelectedBrand(key)}
                  className="flex items-center gap-4 bg-white rounded-lg border border-neutral-200 hover:border-black p-3 cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-50 rounded border border-neutral-100 shrink-0">
                    {!broken ? (
                      <img src={src} alt={brand.brand_name} loading="lazy" onError={() => handleImgError(src)} className="max-h-6 max-w-6 object-contain" />
                    ) : (
                      <span className="text-neutral-300 text-xs">—</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-black truncate">{brand.brand_name}</h3>
                    <p className="text-xs text-neutral-400 truncate">{brand.category} · {brand.assets.length} variant{brand.assets.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <p>LogoLibrary — Open Source</p>
          <p>Built by Mohamed Ajmal Ifthikar</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedBrandData && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBrand(null)}>
          <div className="bg-white border border-neutral-200 rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-black">{selectedBrandData.brand_name}</h2>
                  <span className="inline-block mt-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded border border-neutral-200">
                    {selectedBrandData.category}
                  </span>
                </div>
                <button onClick={() => setSelectedBrand(null)} className="text-neutral-400 hover:text-black text-2xl leading-none">×</button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedBrandData.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-neutral-50 text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-100">{tag}</span>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Assets</h3>
                {selectedBrandData.assets.map((asset) => {
                  const src = getLocalPath(selectedBrand, selectedBrandData, asset);
                  const cdnUrl = toCloudinaryUrl(asset.path);
                  const copyId = `${selectedBrand}-${asset.type}`;
                  return (
                    <div key={asset.type} className="flex items-center gap-3 bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                      <div className="w-10 h-10 flex items-center justify-center bg-white rounded border border-neutral-200 shrink-0">
                        <img src={src} alt={asset.type} className="max-h-6 max-w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black capitalize">{asset.type}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{asset.path}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(asset.path, copyId)} className="px-2.5 py-1.5 text-[11px] font-medium rounded bg-black text-white hover:bg-neutral-800 transition-colors">
                          {copiedKey === copyId ? "Copied" : "Copy Path"}
                        </button>
                        <button onClick={() => handleCopy(cdnUrl, `${copyId}-cdn`)} className="px-2.5 py-1.5 text-[11px] font-medium rounded border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors">
                          {copiedKey === `${copyId}-cdn` ? "Copied" : "CDN"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-400">
                Brand logos are trademarks of their respective owners. Use the CDN URL for production sites.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
