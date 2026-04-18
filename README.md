# 🧊 openmarks.
> The visual intelligence dashboard and 3D Studio for the `logolibrary.` ecosystem.

`openmarks.` is a high-performance web application designed to search, preview, and manipulate brand visual identities. Its core engineering differentiator is a custom **3D Extrusion Studio** that converts flat SVG vectors into interactive, production-ready PBR models.

## 🚀 Features
- **Instant Intelligence**: Sub-millisecond search across 1,147+ brand identities via JSON-first metadata.
- **3D Extrusion Engine**: Real-time triangulation of complex SVG paths into 3D meshes with custom depth and bevel control.
- **PBR Material Studio**: Physically Based Rendering support for chrome, glass, gold, and holographic material presets.
- **One-Click Integration**: Instantly copy Cloudinary CDN URLs or local paths for seamless design-to-code workflows.
- **Monochromatic UI**: Strictly adheres to the minimalist engineering aesthetic of the `opendisorder.` ecosystem.

## 🛠️ Technical Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Graphics**: Three.js + React Three Fiber
- **Triangulation**: Custom `3dsvg` recursive path parsing
- **Motion**: Framer Motion 3D for camera transitions and idle states

## 📦 Installation
```bash
git clone https://github.com/opendisorder/openmarks..git
npm install
```

## 🎯 Usage
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## ⚖️ License
MIT. Part of the `opendisorder.` ecosystem.

---
Built by [Jay J](https://github.com/opendisorder)
