# Lunoris: Piece of Mind — Official Landing Page & News Portal

Official game website and news portal for **Lunoris: Piece of Mind** (PC, PlayStation 5 & Xbox Series X|S).
Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**.

---

## Quick Start

```bash
# Development server
npm run dev

# Production build & start
npm run build
npm run start
```

---

## Project Structure

- [`src/app/layout.tsx`](./src/app/layout.tsx) — App Router root layout with the custom `Ovo-Regular` font and metadata.
- [`src/app/page.tsx`](./src/app/page.tsx) — Main game landing page featuring the Hero video, Gamescom "Van Gogh" Award crest, Latest News carousel, World realms showcase, Luminous Companions gallery, Voice Cast wall, and Release Roadmap.
- [`src/app/news/page.tsx`](./src/app/news/page.tsx) — Full filterable News Archive page (`/news`).
- [`src/app/news/[slug]/page.tsx`](./src/app/news/%5Bslug%5D/page.tsx) — Single News Article page (`/news/[slug]`).
- [`src/data/gameData.ts`](./src/data/gameData.ts) — Typed character cast and release roadmap data.
- [`src/data/newsData.ts`](./src/data/newsData.ts) — Typed articles and media for the News portal.
- [`src/app/globals.css`](./src/app/globals.css) — Custom painterly canvas styles and responsive layout rules.
- [`public/assets/`](./public/assets) — Game artwork, character portraits, awards, and gameplay videos.
