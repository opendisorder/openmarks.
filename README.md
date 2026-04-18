# 🌐 Logo Explorer Dashboard

The professional web interface for the Open Source Logo & Icon Library.

## ⚡ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 🚀 Getting Started
1. Install dependencies: \`npm install\`
2. Run development server: \`npm run dev\`
3. Open [http://localhost:3000](http://localhost:3000)

## 🛠 Maintenance
To update the library view:
1. Copy the updated \`metadata.json\` from the root \`Logo_Library\` into \`src/app/metadata.json\`.
2. Ensure new assets are synced to Cloudinary.
3. Push to main to trigger auto-deployment on Vercel.

## 🔗 Cloudinary Integration
To switch from local assets to CDN URLs, update the \`src/app/page.tsx\` to read from the Cloudinary \`url\` field in the manifest.
