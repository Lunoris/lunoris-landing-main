import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60 MB

export interface DetectedMediaType {
  ext: "jpg" | "png" | "webp" | "avif" | "mp4" | "webm";
  mime: string;
  kind: "image" | "video";
}

/**
 * Inspects binary Magic Bytes (file header signature) to determine the true
 * media type. Never trusts client-provided Content-Type or filename extension.
 * Explicitly excludes SVG/HTML/XML to prevent Stored XSS.
 */
export function detectMediaMagicBytes(buf: Buffer): DetectedMediaType | null {
  if (buf.length < 12) return null;

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png", kind: "image" };
  }

  // 2. JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg", kind: "image" };
  }

  // 3. WebP: "RIFF" .... "WEBP"
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp", kind: "image" };
  }

  // 4. ISO Base Media File Format (MP4 or AVIF): [size:4]"ftyp"[brand:4]
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii").toLowerCase();
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return { ext: "avif", mime: "image/avif", kind: "image" };
    }
    return { ext: "mp4", mime: "video/mp4", kind: "video" };
  }

  // 5. WebM / Matroska EBML header: 1A 45 DF A3
  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return { ext: "webm", mime: "video/webm", kind: "video" };
  }

  return null;
}

export interface SavedMediaAsset {
  url: string;
  filename: string;
  mime: string;
  kind: "image" | "video";
  size: number;
  sha256: string;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "news");

/**
 * Validates binary buffer magic bytes, enforces size limits, and writes
 * atomically into `public/uploads/news/<timestamp>-<hash>.<ext>`.
 */
export async function saveUploadedMediaBuffer(
  buf: Buffer,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  if (buf.length === 0) {
    throw new Error("Uploaded media file is empty.");
  }

  const detected = detectMediaMagicBytes(buf);
  if (!detected) {
    throw new Error(
      "Unsupported or unsafe media file format. Allowed formats (verified by binary signature): JPG, PNG, WEBP, AVIF, MP4, WEBM."
    );
  }

  if (expectedKind && detected.kind !== expectedKind) {
    throw new Error(
      `Expected a ${expectedKind} file, but received ${detected.mime}.`
    );
  }

  const maxBytes =
    detected.kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (buf.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(
      `File exceeds maximum allowed size for ${detected.kind} (${maxMb} MB).`
    );
  }

  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
  const shortHash = sha256.slice(0, 16);
  const filename = `${Date.now()}-${shortHash}.${detected.ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const targetPath = path.join(UPLOAD_DIR, filename);
  const tempPath = `${targetPath}.tmp-${ process.pid }`;

  await fs.writeFile(tempPath, buf);
  await fs.rename(tempPath, targetPath);

  return {
    url: `/uploads/news/${filename}`,
    filename,
    mime: detected.mime,
    kind: detected.kind,
    size: buf.length,
    sha256,
  };
}

/**
 * Checks whether a hostname is a private/loopback/internal address to prevent SSRF.
 */
export function isPrivateOrInternalHost(hostname: string): boolean {
  const h = hostname.toLowerCase().trim();
  if (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h === "[::1]" ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 private / loopback / link-local ranges
  const ipv4Match = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }

  return false;
}

/**
 * Validates a media reference string. Supports:
 * 1) Local paths starting with `/assets/` or `/uploads/news/` (blocks `..` traversal)
 * 2) External `https://` URLs (and `http://` if non-private host)
 */
export function validateMediaUrlOrPath(
  rawUrl: string,
  fieldName: string
): string {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) {
    throw new Error(`Invalid media link in "${fieldName}".`);
  }

  // Case 1: Local public asset path
  if (trimmed.startsWith("/")) {
    if (
      trimmed.includes("..") ||
      trimmed.includes("\\") ||
      trimmed.startsWith("//")
    ) {
      throw new Error(`Path traversal is not allowed in "${fieldName}".`);
    }
    if (
      !trimmed.startsWith("/assets/") &&
      !trimmed.startsWith("/uploads/news/")
    ) {
      throw new Error(
        `Local path in "${fieldName}" must start with "/assets/" or "/uploads/news/".`
      );
    }
    if (!/^\/[a-zA-Z0-9/_.-]+$/.test(trimmed)) {
      throw new Error(`Invalid characters in local path "${fieldName}".`);
    }
    return trimmed;
  }

  // Case 2: External URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid URL in "${fieldName}". Provide a valid https:// URL or local /assets/ or /uploads/news/ path.`
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `Unsupported URL protocol "${parsed.protocol}" in "${fieldName}". Only https:// (or http://) is allowed.`
    );
  }

  if (isPrivateOrInternalHost(parsed.hostname)) {
    throw new Error(
      `Internal or private network host "${parsed.hostname}" is not allowed in "${fieldName}".`
    );
  }

  return parsed.toString();
}

/**
 * Optionally downloads an external media URL, verifies its Magic Bytes and size,
 * and saves a local copy into `/uploads/news/`.
 */
export async function downloadAndSaveExternalMedia(
  externalUrl: string,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  const safeUrl = validateMediaUrlOrPath(externalUrl, "mediaUrl");
  if (safeUrl.startsWith("/")) {
    throw new Error("URL is already a local path.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(safeUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch remote media (${response.status} ${response.statusText}).`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);
    return await saveUploadedMediaBuffer(buf, expectedKind);
  } finally {
    clearTimeout(timeout);
  }
}
