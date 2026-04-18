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
  const [showHero, setShowHero] = useState(true);

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

  useEffect(() => {
    if (search || selectedCategory !== "All") setShowHero(false);
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0e0e0] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#0f3460]/60 bg-[#1a1a2e]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e94560] flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#e94560]">Logo</span>Library
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#browse" className="text-gray-400 hover:text-white transition-colors">Browse</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {showHero && !selectedBrand && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e94560]/5 via-transparent to-[#0f3460]/10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center relative">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Open Source</span>
              <br />
              <span className="bg-gradient-to-r from-[#e94560] to-[#ff6b81] bg-clip-text text-transparent">
                Brand Logo Library
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              {stats.brands.toLocaleString()}+ brand logos & UI icons. Searchable, categorized, and ready to drop into your next project.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12">
              {[
                { label: "Brands", value: stats.brands },
                { label: "Assets", value: stats.assets },
                { label: "Categories", value: stats.cats },
              ].map((s) => (
                <div key={s.label} className="bg-[#16213e]/80 border border-[#0f3460]/40 rounded-2xl px-8 py-5 min-w-[140px]">
                  <div className="text-3xl font-bold text-white">{s.value.toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {categories.slice(1, 8).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowHero(false); }}
                  className="px-4 py-2 rounded-full bg-[#16213e] border border-[#0f3460]/40 text-sm text-gray-300 hover:border-[#e94560]/40 hover:text-white transition-all"
                >
                  {cat} <span className="text-gray-500">({count})</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <section id="browse" className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search brands, tags, industries..."
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-xl px-5 py-4 pl-12 text-base focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/30 transition-all placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            className="bg-[#16213e] border border-[#0f3460] rounded-xl px-5 py-4 focus:outline-none focus:border-[#e94560] min-w-[220px] cursor-pointer text-gray-200"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(([cat, count]) => (
              <option key={cat} value={cat}>{cat} ({count})</option>
            ))}
          </select>
          <div className="flex bg-[#16213e] border border-[#0f3460] rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`px-4 py-3 ${viewMode === "grid" ? "bg-[#e94560]/20 text-[#e94560]" : "text-gray-500 hover:text-gray-300"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button onClick={() => setViewMode("list")} className={`px-4 py-3 ${viewMode === "list" ? "bg-[#e94560]/20 text-[#e94560]" : "text-gray-500 hover:text-gray-300"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="text-gray-300 font-medium">{filteredLogos.length.toLocaleString()}</span> of {stats.brands.toLocaleString()} brands
          </p>
          {(search || selectedCategory !== "All") && (
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); setShowHero(true); }}
              className="text-sm text-[#e94560] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredLogos.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No logos found</h3>
            <p className="text-gray-500">Try a different search term or category.</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && filteredLogos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filteredLogos.map(([key, brand]) => {
              const src = getLocalPath(key, brand);
              const broken = imgErrors.has(src);
              return (
                <div
                  key={key}
                  onClick={() => setSelectedBrand(key)}
                  className="group bg-[#16213e] rounded-xl border border-[#0f3460]/60 hover:border-[#e94560]/50 hover:shadow-lg hover:shadow-[#e94560]/5 transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-28 flex items-center justify-center p-4 relative">
                    {!broken ? (
                      <img
                        src={src}
                        alt={brand.brand_name}
                        loading="lazy"
                        onError={() => handleImgError(src)}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300 [filter:invert(1)_brightness(1.8)]"
                      />
                    ) : (
                      <div className="text-gray-600 text-xs text-center">
                        <div className="text-2xl mb-1">🖼️</div>
                        Preview unavailable
                      </div>
                    )}
                    {brand.assets.length > 1 && (
                      <span className="absolute top-2 right-2 text-[10px] bg-[#0f3460]/80 text-gray-300 px-1.5 py-0.5 rounded">
                        {brand.assets.length}
                      </span>
                    )}
                  </div>
                  <div className="px-3 pb-3 pt-0">
                    <h3 className="text-center font-semibold text-sm truncate text-gray-200">{brand.brand_name}</h3>
                    <p className="text-center text-[10px] text-gray-500 mt-0.5 truncate">{brand.category}</p>
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
                  className="flex items-center gap-4 bg-[#16213e] rounded-xl border border-[#0f3460]/60 hover:border-[#e94560]/50 p-4 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-[#1a1a2e] rounded-lg border border-[#0f3460]/40 shrink-0">
                    {!broken ? (
                      <img src={src} alt={brand.brand_name} loading="lazy" onError={() => handleImgError(src)} className="max-h-8 max-w-8 object-contain [filter:invert(1)_brightness(1.8)]" />
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-200 truncate">{brand.brand_name}</h3>
                    <p className="text-xs text-gray-500 truncate">{brand.category} · {brand.assets.length} asset{brand.assets.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {brand.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-[#0f3460]/40 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0f3460]/40 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>LogoLibrary — Open Source Brand Logo Collection</p>
          <p>Built with Next.js + Tailwind · Maintained by Mohamed Ajmal Ifthikar</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedBrandData && selectedBrand && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBrand(null)}>
          <div className="bg-[#16213e] border border-[#0f3460] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedBrandData.brand_name}</h2>
                  <span className="inline-block mt-2 text-xs bg-[#e94560]/10 text-[#e94560] px-3 py-1 rounded-full border border-[#e94560]/20 font-medium">
                    {selectedBrandData.category}
                  </span>
                </div>
                <button onClick={() => setSelectedBrand(null)} className="text-gray-400 hover:text-white text-3xl leading-none p-1">×</button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrandData.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#0f3460]/40 text-gray-400 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {selectedBrandData.assets.map((asset) => {
                  const src = getLocalPath(selectedBrand, selectedBrandData, asset);
                  const cdnUrl = toCloudinaryUrl(asset.path);
                  const copyId = `${selectedBrand}-${asset.type}`;
                  return (
                    <div key={asset.type} className="bg-[#1a1a2e] rounded-xl border border-[#0f3460]/40 p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 flex items-center justify-center bg-[#16213e] rounded-lg border border-[#0f3460]/40 shrink-0">
                          <img src={src} alt={asset.type} className="max-h-10 max-w-10 object-contain [filter:invert(1)_brightness(1.8)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-200 capitalize">{asset.type}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{asset.format}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button onClick={() => handleCopy(asset.path, copyId)} className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/20 hover:bg-[#e94560]/20 transition-colors flex items-center justify-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          {copiedKey === copyId ? "Copied!" : "Copy Local Path"}
                        </button>
                        <button onClick={() => handleCopy(cdnUrl, `${copyId}-cdn`)} className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-[#0f3460]/30 text-gray-300 border border-[#0f3460]/40 hover:bg-[#0f3460]/50 transition-colors flex items-center justify-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {copiedKey === `${copyId}-cdn` ? "Copied!" : "Copy CDN URL"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Usage hint */}
              <div className="p-4 rounded-xl bg-[#0f3460]/15 border border-[#0f3460]/30 text-xs text-gray-400 leading-relaxed">
                <span className="text-[#e94560] font-medium">💡 Pro tip:</span> Use the CDN URL for production sites (faster global delivery). Use the local path when working inside this repo. Brand logos are trademarks of their respective owners.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
