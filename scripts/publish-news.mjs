#!/usr/bin/env node
/**
 * Lunoris News Publisher CLI (HMAC-SHA256 v2)
 *
 * Supports:
 * 1) Publishing a news JSON file (with optional local image/video upload or remote media URLs):
 *    node scripts/publish-news.mjs --file ./my-article.json --image ./cover.png --video ./teaser.mp4
 *
 * 2) Uploading a standalone media file (JPG, PNG, WEBP, AVIF, MP4, WEBM):
 *    node scripts/publish-news.mjs --upload ./cover.png
 *
 * 3) Mirroring an external media URL onto the server's /uploads/news/:
 *    node scripts/publish-news.mjs --mirror-url https://example.com/artwork.jpg
 *
 * 4) Deleting an article by slug:
 *    node scripts/publish-news.mjs --delete my-article-slug
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

async function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore if .env.local does not exist
  }
}

function buildAuthHeaders(method, pathname, bodyBytes = Buffer.alloc(0)) {
  const apiKey = process.env.LUNORIS_NEWS_API_KEY || "";
  const hmacSecret = process.env.LUNORIS_NEWS_HMAC_SECRET || apiKey;
  if (!apiKey && !hmacSecret) {
    throw new Error(
      "Missing LUNORIS_NEWS_API_KEY or LUNORIS_NEWS_HMAC_SECRET in environment or .env.local"
    );
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const headers = {};

  if (hmacSecret) {
    const bodySha256 = crypto
      .createHash("sha256")
      .update(bodyBytes)
      .digest("hex");
    const canonical = `v2.${timestamp}.${method.toUpperCase()}.${pathname}.${bodySha256}`;
    const sig = crypto
      .createHmac("sha256", hmacSecret)
      .update(canonical, "utf8")
      .digest("hex");
    headers["X-Lunoris-Timestamp"] = timestamp;
    headers["X-Lunoris-Signature"] = `v2=${sig}`;
  }
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}

async function sendMultipartSigned(targetUrl, method, form) {
  const parsedUrl = new URL(targetUrl);
  const serialized = new Request(targetUrl, { method, body: form });
  const contentType = serialized.headers.get("content-type");
  const rawBuffer = Buffer.from(await serialized.arrayBuffer());

  return fetch(targetUrl, {
    method,
    headers: {
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...buildAuthHeaders(method, parsedUrl.pathname, rawBuffer),
    },
    body: rawBuffer,
  });
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function main() {
  await loadEnvLocal();
  const args = parseArgs(process.argv);
  const baseUrl = (
    args.url ||
    process.env.LUNORIS_SITE_URL ||
    "http://localhost:3001"
  ).replace(/\/+$/, "");

  // 1. Delete article by slug
  if (typeof args.delete === "string") {
    const targetUrl = `${baseUrl}/api/news/${encodeURIComponent(args.delete)}`;
    const parsedUrl = new URL(targetUrl);
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: buildAuthHeaders("DELETE", parsedUrl.pathname, ""),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    process.exit(res.ok ? 0 : 1);
  }

  // 2. Upload standalone media file
  if (typeof args.upload === "string") {
    const fileBuf = await fs.readFile(args.upload);
    const form = new FormData();
    form.append("file", new Blob([fileBuf]), path.basename(args.upload));
    const res = await sendMultipartSigned(
      `${baseUrl}/api/news/upload`,
      "POST",
      form
    );
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    process.exit(res.ok ? 0 : 1);
  }

  // 3. Mirror external media URL
  if (typeof args["mirror-url"] === "string") {
    const targetUrl = `${baseUrl}/api/news/upload`;
    const parsedUrl = new URL(targetUrl);
    const rawBody = JSON.stringify({ url: args["mirror-url"] });
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders("POST", parsedUrl.pathname, Buffer.from(rawBody, "utf8")),
      },
      body: rawBody,
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    process.exit(res.ok ? 0 : 1);
  }

  // 4. Publish article (JSON or multipart with files)
  if (typeof args.file === "string") {
    const rawJson = await fs.readFile(args.file, "utf8");
    const parsed = JSON.parse(rawJson);
    const targetUrl = `${baseUrl}/api/news`;

    if (args.image || args.video) {
      const form = new FormData();
      form.append("payload", JSON.stringify(parsed));

      if (typeof args.image === "string") {
        const imgBuf = await fs.readFile(args.image);
        form.append("imageFile", new Blob([imgBuf]), path.basename(args.image));
      }
      if (typeof args.video === "string") {
        const vidBuf = await fs.readFile(args.video);
        form.append("videoFile", new Blob([vidBuf]), path.basename(args.video));
      }

      const res = await sendMultipartSigned(targetUrl, "POST", form);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
      process.exit(res.ok ? 0 : 1);
    } else {
      const parsedUrl = new URL(targetUrl);
      const bodyStr = JSON.stringify(parsed);
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders("POST", parsedUrl.pathname, Buffer.from(bodyStr, "utf8")),
        },
        body: bodyStr,
      });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
      process.exit(res.ok ? 0 : 1);
    }
  }

  console.log(`Usage:
  node scripts/publish-news.mjs --file <article.json> [--image <cover.png>] [--video <clip.mp4>]
  node scripts/publish-news.mjs --upload <media-file>
  node scripts/publish-news.mjs --mirror-url <https://...>
  node scripts/publish-news.mjs --delete <slug>`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
