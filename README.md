# Lunoris: Piece of Mind — Investor Portal (Next.js 16)

Interactive investor & publisher pitch portal for **Lunoris: Piece of Mind** by **Lunoris Studios**.
Built on the same stack as [`lunoris-wiki`](../lunoris-wiki/): **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**.

---

## Quick Start

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build & start
npm run build
npm run start
```

---

## Project Architecture

- [`src/app/layout.tsx`](./src/app/layout.tsx) — App Router root layout with Lunoris brand typography (`Ovo`, `REM`, `Cormorant Garamond`, `Space Mono`) and metadata.
- [`src/app/page.tsx`](./src/app/page.tsx) — Interactive investor portal page featuring the Executive Snapshot, Emotional Engine & HUD Simulator (`Assisted / Hybrid / Immersive`), 5 Realms Explorer with live gameplay video, SAG-AFTRA Voice Cast, 24M / 18M Roadmap Switcher, Leadership Roster, and Data Room request form.
- [`src/app/api/investor-request/route.ts`](./src/app/api/investor-request/route.ts) — Next.js Route Handler (`POST /api/investor-request`) for Data Room and playable build requests.
- [`src/data/pitchData.ts`](./src/data/pitchData.ts) — Typed data sourced from the *Lunoris Game Bible (Updates 13–15)* and studio production reports.
- [`src/app/globals.css`](./src/app/globals.css) — Brand design tokens and styles aligned with `lunorisstudios.com` + Tailwind CSS v4.
- [`public/assets/`](./public/assets) — Local logos, backgrounds, ELAR biome art, and the `car-level-loop.mp4` gameplay loop.
