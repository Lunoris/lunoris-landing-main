# Lunoris: Piece of Mind — Official Landing Page & News Portal

Official game website and news portal for **Lunoris: Piece of Mind** (PC, PlayStation 5 & Xbox Series X|S).  
Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript 5**, and **Tailwind CSS v4**.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables template and configure your API secrets
cp .env.example .env.local

# Start development server (default port 3000, or custom port e.g. 3001)
npm run dev
npx next dev -p 3001

# Production build & start
npm run build
npm run start
```

---

## Architecture & Project Structure

```text
├── public/
│   ├── assets/                        # Core game artwork, portraits, and faststart MP4 loops
│   ├── fonts/                         # Custom Ovo-Regular typeface
│   └── uploads/news/                  # Dynamically uploaded news images & videos
├── data/
│   └── published-news.json            # Atomic persistent store for published news (auto-seeded)
├── scripts/
│   └── publish-news.mjs               # CLI tool for HMAC-signed news publishing & media upload
└── src/
    ├── app/
    │   ├── layout.tsx                 # Root layout, Ovo font, OpenGraph & Twitter metadata
    │   ├── page.tsx                   # Declarative composition of landing page sections
    │   ├── globals.css                # Painterly canvas system, animations & responsive breakpoints
    │   ├── news/
    │   │   ├── page.tsx               # Filterable News Archive (/news)
    │   │   └── [slug]/page.tsx        # Dynamic Single News Article page (/news/[slug])
    │   └── api/
    │       └── news/
    │           ├── route.ts           # GET /api/news & POST /api/news
    │           ├── [slug]/route.ts    # GET, PATCH & DELETE /api/news/[slug]
    │           └── upload/route.ts    # POST /api/news/upload (file upload & remote URL mirroring)
    ├── components/
    │   ├── sections/                  # Modular page sections with colocated state
    │   │   ├── HeaderBar.tsx          # Sticky header + flying Steam icon / Ethereal Moonlight CTA
    │   │   ├── HeroSection.tsx        # Hero video backdrop, quote & Gamescom "Van Gogh" Award crest
    │   │   ├── LatestNewsSection.tsx  # 4-card painterly news carousel
    │   │   ├── WorldPortalsSection.tsx# 3 arched living realm portals (#world)
    │   │   ├── CompanionsSection.tsx  # 4 auto-cycling guardian pillars (#companions)
    │   │   ├── CharactersWallSection.tsx # Dual counter-scrolling character marquee (#characters)
    │   │   ├── RoadmapSection.tsx     # Scroll-driven vertical beam timeline (#roadmap)
    │   │   ├── FinalCtaSection.tsx    # Bottom mural & landing slot for the flying Steam button
    │   │   └── FooterBar.tsx          # Site footer
    │   └── ui/                        # Reusable UI & SVG primitives
    │       ├── CanvasFrames.tsx       # Painterly SVG frames, stars, laurels & crescent pill button
    │       ├── NewsArticleCard.tsx    # Shared news card used across home, archive & related blocks
    │       └── ResilientVideo.tsx     # Fault-tolerant <video> with IntersectionObserver & stall recovery
    ├── hooks/
    │   └── useLunorisScrollEffects.ts # Scroll reveal, Hero parallax, Roadmap beam & Cubic Bézier CTA flight
    ├── lib/
    │   ├── newsAuth.ts                # HMAC-SHA256 + timing-safe Bearer auth, IP allowlist & rate limiter
    │   ├── mediaUpload.ts             # Magic-bytes binary validator, atomic uploader & SSRF guard
    │   ├── newsValidator.ts           # Schema sanitizer, slug generator & media link validator
    │   └── newsStore.ts               # Mutex-protected atomic JSON store + Next.js cache revalidation
    └── data/
        ├── gameData.ts                # Typed world locations, companions, characters & roadmap data
        └── newsData.ts                # Seed news articles & TypeScript interfaces
```

---

## News Publishing & Media Upload API

The site operates **without user accounts** on the frontend. Content publishing is handled through a hardened server-to-server / CLI API protected by cryptographic authentication, binary signature inspection, and rate limiting.

### 1. Security Configuration (`.env.local`)

Configure the following server-only variables in `.env.local` (see [`.env.example`](./.env.example)):

```env
# Bearer API Key for Authorization: Bearer <key> or X-Api-Key headers
LUNORIS_NEWS_API_KEY="your_64_char_random_hex_key"

# HMAC-SHA256 secret for X-Lunoris-Timestamp + X-Lunoris-Signature verification
LUNORIS_NEWS_HMAC_SECRET="your_64_char_random_hmac_secret"

# Optional comma-separated IP allowlist for write operations (empty = allow any IP with valid credentials)
LUNORIS_ALLOWED_IPS=""
```

#### Built-in Security Layers
- **HMAC-SHA256 Request Signing + Replay Protection**: Verifies `X-Lunoris-Timestamp` (must be within `±300s` of server time) and `X-Lunoris-Signature: sha256=<HMAC(secret, timestamp + "." + rawBody)>`.
- **Timing-Safe Bearer Token Auth**: Verifies `Authorization: Bearer <key>` or `X-Api-Key` using `crypto.timingSafeEqual` over SHA-256 digests so secret length and characters cannot be leaked via timing attacks.
- **Brute-Force Lockout & Rate Limiting**: Locks out an IP (`429 Too Many Requests`) for 15 minutes after 5 failed authentication attempts and caps write operations at 40 per hour.
- **Binary Magic Bytes Media Verification**: Inspects raw file header bytes (`JPG`, `PNG`, `WEBP`, `AVIF`, `MP4`, `WEBM`) rather than trusting file extensions or `Content-Type`. Explicitly blocks `SVG`, `HTML`, and scripts to prevent Stored XSS.
- **SSRF & Path Traversal Protection**: Local media paths are restricted to `/assets/...` and `/uploads/news/...` (blocking `..`), while external media URLs block private/internal network ranges (`localhost`, `127.*`, `10.*`, `172.16-31.*`, `192.168.*`, `169.254.*`).

---

### 2. API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/news` | Public | List all news articles. Supports `?category=Update\|World+%26+Lore\|Video` and `?limit=N`. |
| `GET` | `/api/news/[slug]` | Public | Fetch a single article by its `slug`. |
| `POST` | `/api/news` | 🔒 Protected | Create or upsert a news article via `application/json` (media URLs) or `multipart/form-data` (direct file upload). |
| `PATCH` | `/api/news/[slug]` | 🔒 Protected | Partially or fully update an existing article by `slug` (`application/json` or `multipart/form-data`). |
| `DELETE` | `/api/news/[slug]` | 🔒 Protected | Delete an article by `slug` and revalidate pages. |
| `POST` | `/api/news/upload` | 🔒 Protected | Upload standalone image/video files (`multipart/form-data`) or mirror an external media URL (`application/json`). |

---

### 3. Media Handling: Direct File Upload vs. External URL

Every news article supports media (`image`, `videoSrc`, `sections[].image`) in **three ways**:

1. **Direct Binary File Upload (`multipart/form-data`)**:
   - Upload files directly in `POST /api/news` (`imageFile`, `videoFile`, `sectionImage_0`, ...) or first via `POST /api/news/upload`.
   - Size limits: **15 MB** per image (`JPG`, `PNG`, `WEBP`, `AVIF`), **60 MB** per video (`MP4`, `WEBM`).
   - Saved atomically to `/uploads/news/<timestamp>-<sha256>.<ext>`.
2. **External Media URL (`https://...`) or Local Asset Path (`/assets/...`)**:
   - Pass any valid `https://` image/video link or `/assets/...` path directly inside the JSON body.
3. **Server-Side Remote URL Mirroring (`"mirrorExternalMedia": true`)**:
   - Pass external `https://` links in your JSON along with `"mirrorExternalMedia": true` (or call `POST /api/news/upload` with `{ "url": "https://..." }`), and the server will download the remote file, verify its Magic Bytes, and store a local copy in `/uploads/news/`.

---

### 4. Usage Examples

#### A. Using the Built-In CLI (`scripts/publish-news.mjs`)

The CLI automatically reads `.env.local` and signs every request with `HMAC-SHA256`:

```bash
# 1. Publish an article from JSON and upload local cover image + video in one request
node scripts/publish-news.mjs --file ./article.json --image ./cover.png --video ./teaser.mp4

# 2. Publish an article from JSON that uses external media URLs
node scripts/publish-news.mjs --file ./article.json

# 3. Upload a standalone image or video file and get its /uploads/news/... path
node scripts/publish-news.mjs --upload ./cover.png

# 4. Download & mirror an external media URL onto the server
node scripts/publish-news.mjs --mirror-url https://example.com/banner.jpg

# 5. Delete an article by slug
node scripts/publish-news.mjs --delete my-article-slug
```

#### B. Publishing via `curl` with Media URLs (`application/json`)

```bash
curl -X POST http://localhost:3001/api/news \
  -H "Authorization: Bearer $LUNORIS_NEWS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sanctuary Update 0.5: New Dream Doors",
    "category": "Update",
    "image": "https://example.com/sanctuary-cover.jpg",
    "mirrorExternalMedia": false,
    "excerpt": "Step through newly awakened Dream Doors into floating watercolor ruins.",
    "lead": "Full opening paragraph introducing the new sanctuary update...",
    "highlights": [
      "Three new floating island encounters",
      "Enhanced companion synergy for Fareeda and Kurtam"
    ],
    "sections": [
      {
        "heading": "Painting the Sky",
        "paragraphs": [
          "First paragraph of the section...",
          "Second paragraph of the section..."
        ],
        "quote": "Every memory leaves a brushstroke in the dark.",
        "image": "/assets/dream-level-1.png",
        "imageCaption": "Concept vista of the upper Dream Islands."
      }
    ]
  }'
```

#### C. Publishing via `curl` with Direct File Upload (`multipart/form-data`)

```bash
curl -X POST http://localhost:3001/api/news \
  -H "Authorization: Bearer $LUNORIS_NEWS_API_KEY" \
  -F 'payload={"title":"New Gameplay Teaser","category":"Video","excerpt":"Watch the new midnight highway sequence.","sections":[{"heading":"1988 Highway","paragraphs":["Full details inside."]}]}' \
  -F "imageFile=@./cover.jpg" \
  -F "videoFile=@./teaser.mp4"
```
