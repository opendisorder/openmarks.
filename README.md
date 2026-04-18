# openmarks.

> The official web dashboard for [openmarks.](https://github.com/ajmaliifthikar-ux/logo-library) — search, preview, and copy 1,100+ brand logos instantly. Now with an AI-powered 3D extrusion studio.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ajmaliifthikar-ux/logo-library-web)

**Live:** [openmarks.vercel.app](https://openmarks.vercel.app)

---

## ⚡ Features

- 🔍 **Instant Search** — by brand name, tag, or category
- 🏷️ **Category Filtering** — 9 curated industries
- 📋 **One-Click Copy** — local path or Cloudinary CDN URL
- 🖼️ **Asset Variants** — view icon, wordmark, full, and default versions
- 🎨 **3D Studio** — extrude any logo into 3D with materials, lighting & animation
- 🤖 **AI 3D Pipeline** *(coming soon)* — intelligent shape analysis & material assignment
- 📱 **Responsive** — works on mobile, tablet, and desktop
- 🌙 **Dark UI** — built with your brand colors (#e94560 on #1a1a2e)

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 🛠 Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, static generation
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Three.js](https://threejs.org/) + [`3dsvg`](https://www.npmjs.com/package/3dsvg) — 3D logo extrusion

---

## 📁 Project Structure

```
openmarks/
├── src/app/
│   ├── page.tsx              # Main explorer UI
│   ├── studio/page.tsx       # 3D Studio
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── metadata.json         # Logo metadata
│   └── components/
│       ├── BrandLogo.tsx     # Reusable brand component
│       ├── Logo3D.tsx        # 3D preview wrapper
│       └── LogoModal.tsx     # Detail modal
├── public/assets/            # Logo SVG/PNG files
├── next.config.ts
└── package.json
```

---

## 🔄 Updating the Library

When the core library grows:

1. Copy the updated `metadata.json` from `Logo_Library/` into `src/app/`
2. Sync new assets to `public/assets/`
3. Commit and push — Vercel auto-deploys

---

## 📄 License

MIT — see the core [logo-library repo](https://github.com/ajmaliifthikar-ux/logo-library) for full details.

---

Built by [Mohamed Ajmal Ifthikar](https://github.com/ajmalifthikar)
