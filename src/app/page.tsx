"use client";

import { useState, useMemo } from 'react';
import logoData from './metadata.json';

export default function LogoExplorer() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(Object.values(logoData).map((b: any) => b.category));
    return ['All', ...Array.from(cats)].sort();
  }, []);

  const filteredLogos = useMemo(() => {
    return Object.entries(logoData).filter(([key, brand]: [string, any]) => {
      const matchesSearch = key.includes(search.toLowerCase()) || 
                           brand.tags.some((t: string) => t.includes(search.toLowerCase()));
      const matchesCat = selectedCategory === 'All' || brand.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#e0e0e0] p-8">
      <header className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#e94560] to-[#0f3460] bg-clip-text text-transparent">
          Logo & Icon Explorer
        </h1>
        <p className="text-xl text-gray-400">Professional Open Source Asset Library</p>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search brands, tags, or industries..."
            className="flex-1 bg-[#16213e] border border-[#0f3460] rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-[#e94560] transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="bg-[#16213e] border border-[#0f3460] rounded-lg px-6 py-4 focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredLogos.map(([key, brand]: [string, any]) => (
            <div key={key} className="bg-[#16213e] p-6 rounded-xl border border-[#0f3460] hover:border-[#e94560] transition-all group cursor-pointer">
              <div className="h-20 flex items-center justify-center mb-4">
                {/* Fallback to local public path, will be Cloudinary URLs in next phase */}
                <img 
                  src={`/assets/${brand.category.replace(/ & /g, '_and_').replace(/ /g, '_')}/${key}/${brand.assets[0].path.split('/').pop()}`} 
                  alt={brand.brand_name}
                  className="max-h-full max-w-full group-hover:scale-110 transition-transform duration-300 invert brightness-200"
                />
              </div>
              <h3 className="text-center font-medium text-sm truncate">{brand.brand_name}</h3>
              <p className="text-center text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{brand.assets[0].type}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
