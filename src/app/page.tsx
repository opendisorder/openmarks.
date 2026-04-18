"use client";

import { useState, useMemo, useCallback } from "react";
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

export default function LogoExplorer() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const data = useMemo(() => logoData as Record<string, Brand>, []);

  const categories = useMemo(() => {
    const cats = new Set(Object.values(data).map((b) => b.category));
    return ["All", ...Array.from(cats)].sort();
  }, [data]);

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

  const handleCopy = useCallback(
    (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    },
    []
  );

  const getAssetPath = useCallback((key: string, brand: Brand) => {
    const cat = brand.category
      .replace(/ & /g, "_and_")
      .replace(/ /g, "_");
    const asset =
      brand.assets.find((a) => a.type === "icon") ||
      brand.assets.find((a) => a.type === "default") ||
      brand.assets[0];
    const fname = asset.path.split("/").pop()!;
    return `/assets/${cat}/${key}/${fname}`;
  }, []);

  const handleImgError = useCallback((src: string) => {
    setImgErrors((prev) => new Set(prev).add(src));
  }, []);

  const selectedBrandData = selectedBrand ? data[selectedBrand] : null;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0e0e0]">
      {/* Header */}
      <header className="border-b border-[#0f3460]/60 bg-[#16213e]/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="text-[#e94560]">Logo</span>
                <span className="text-white">Library</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Open-source brand logos & UI icons — searchable, copy-ready,
                CDN-synced
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-full bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/20 font-medium">
                {Object.keys(data).length.toLocaleString()} brands
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#0f3460]/40 text-gray-300 border border-[#0f3460]/40">
                {filteredLogos.length.toLocaleString()} shown
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search brands, tags, industries..."
              className="w-full bg-[#16213e] border border-[#0f3460] rounded-xl px-5 py-3.5 pl-12 text-base focus:outline-none focus:border-[#e94560] focus:ring-1 focus:ring-[#e94560]/30 transition-all placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            className="bg-[#16213e] border border-[#0f3460] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#e94560] min-w-[200px] cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Empty State */}
        {filteredLogos.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No logos found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredLogos.map(([key, brand]) => {
            const src = getAssetPath(key, brand);
            const broken = imgErrors.has(src);
            return (
              <div
                key={key}
                onClick={() => setSelectedBrand(key)}
                className="group bg-[#16213e] rounded-xl border border-[#0f3460]/60 hover:border-[#e94560]/60 hover:shadow-lg hover:shadow-[#e94560]/5 transition-all cursor-pointer flex flex-col"
              >
                {/* Image area */}
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
                  {/* Asset count badge */}
                  {brand.assets.length > 1 && (
                    <span className="absolute top-2 right-2 text-[10px] bg-[#0f3460]/80 text-gray-300 px-1.5 py-0.5 rounded">
                      {brand.assets.length}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="px-3 pb-3 pt-0">
                  <h3 className="text-center font-semibold text-sm truncate text-gray-200">
                    {brand.brand_name}
                  </h3>
                  <p className="text-center text-[10px] text-gray-500 mt-0.5 truncate">
                    {brand.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedBrandData && selectedBrand && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBrand(null)}
        >
          <div
            className="bg-[#16213e] border border-[#0f3460] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedBrandData.brand_name}
                  </h2>
                  <span className="inline-block mt-1 text-xs bg-[#e94560]/10 text-[#e94560] px-2 py-0.5 rounded border border-[#e94560]/20">
                    {selectedBrandData.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedBrandData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-[#0f3460]/40 text-gray-400 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Assets */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Assets
                </h3>
                {selectedBrandData.assets.map((asset) => {
                  const cat = selectedBrandData.category
                    .replace(/ & /g, "_and_")
                    .replace(/ /g, "_");
                  const fname = asset.path.split("/").pop()!;
                  const src = `/assets/${cat}/${selectedBrand}/${fname}`;
                  const copyId = `${selectedBrand}-${asset.type}`;
                  return (
                    <div
                      key={asset.type}
                      className="flex items-center gap-3 bg-[#1a1a2e] rounded-lg p-3 border border-[#0f3460]/40"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-[#16213e] rounded border border-[#0f3460]/40 shrink-0">
                        <img
                          src={src}
                          alt={asset.type}
                          className="max-h-8 max-w-8 object-contain [filter:invert(1)_brightness(1.8)]"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).style.display =
                              "none")
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 capitalize">
                          {asset.type}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {asset.path}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(asset.path, copyId)}
                        className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/20 hover:bg-[#e94560]/20 transition-colors"
                      >
                        {copiedKey === copyId ? "Copied!" : "Copy Path"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* CDN hint */}
              <div className="mt-5 p-3 rounded-lg bg-[#0f3460]/20 border border-[#0f3460]/40 text-xs text-gray-400">
                💡 These assets are also synced to Cloudinary CDN. Check the
                repo README for CDN URLs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
