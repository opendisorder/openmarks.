# 🌐 LogoLibrary Explorer

> The official web dashboard for [LogoLibrary](https://github.com/ajmaliifthikar-ux/logo-library) — search, preview, and copy 1,100+ brand logos instantly.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ajmaliifthikar-ux/logo-library-web)

---

## ⚡ Features

- 🔍 **Instant Search** — by brand name, tag, or category
- 🏷️ **Category Filtering** — 9 curated industries
- 📋 **One-Click Copy** — local path or Cloudinary CDN URL
- 🖼️ **Asset Variants** — view icon, wordmark, full, and default versions
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

---

## 📁 Project Structure

```
logo-explorer/
├── src/app/
│   ├── page.tsx           # Main explorer UI
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── metadata.json      # Logo metadata (copied from Logo_Library)
├── public/assets/         # Logo SVG/PNG files
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

MIT — see the core [LogoLibrary repo](https://github.com/ajmaliifthikar-ux/logo-library) for full details.

---

Built by [Mohamed Ajmal Ifthikar](https://github.com/ajmalifthikar)
