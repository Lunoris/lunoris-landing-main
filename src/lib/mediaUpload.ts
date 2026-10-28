import crypto from "crypto";
import dns from "dns/promises";
import fs from "fs/promises";
import net from "net";
import path from "path";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60 MB

export interface DetectedMediaType {
  ext: "jpg" | "png" | "webp" | "avif" | "mp4" | "webm";
  mime: string;
  kind: "image" | "video";
}

const ALLOWED_MP4_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "iso6",
  "mp41",
  "mp42",
  "avc1",
  "msnv",
  "dash",
  "m4v ",
  "qt  ",
]);

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

  // 4. ISO Base Media File Format (AVIF or MP4): [size:4]"ftyp"[brand:4]
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii").toLowerCase();
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return { ext: "avif", mime: "image/avif", kind: "image" };
    }
    if (ALLOWED_MP4_BRANDS.has(brand)) {
      return { ext: "mp4", mime: "video/mp4", kind: "video" };
    }
    return null;
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
  const tempPath = `${targetPath}.tmp-${process.pid}`;

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
 * Validates `File.size` BEFORE reading `file.arrayBuffer()` into memory,
 * then verifies Magic Bytes and saves atomically.
 */
export async function saveUploadedFileObject(
  file: File,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  if (file.size === 0) {
    throw new Error("Uploaded media file is empty.");
  }

  const ceilingBytes =
    expectedKind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > ceilingBytes) {
    const maxMb = Math.round(ceilingBytes / (1024 * 1024));
    throw new Error(
      `File exceeds maximum allowed size (${maxMb} MB).`
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  return saveUploadedMediaBuffer(buf, expectedKind);
}

/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, link-local,
 * CGNAT, multicast, or unspecified.
 */
export function isPrivateIpAddress(ip: string): boolean {
  const normalized = ip.replace(/^\[|\]$/g, "").toLowerCase();

  // Handle IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1)
  if (normalized.startsWith("::ffff:")) {
    const mappedV4 = normalized.slice(7);
    if (net.isIPv4(mappedV4)) {
      return isPrivateIpAddress(mappedV4);
    }
  }

  if (net.isIPv4(normalized)) {
    const parts = normalized.split(".").map(Number);
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // Link-local / Cloud metadata 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
    if (a === 192 && b === 168) return true; // RFC1918
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // Multicast & reserved
    return false;
  }

  if (net.isIPv6(normalized)) {
    if (normalized === "::1" || normalized === "::") return true;
    if (normalized.startsWith("fe80:")) return true; // Link-local
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // Unique local
    if (normalized.startsWith("ff")) return true; // Multicast
    return false;
  }

  return true;
}

/**
 * Checks whether a hostname is a private/loopback/internal address to prevent SSRF.
 */
export function isPrivateOrInternalHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase().trim();
  if (
    !h ||
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^\d+$/.test(h) // Block decimal-encoded IPv4 like http://2130706433
  ) {
    return true;
  }

  if (net.isIP(h)) {
    return isPrivateIpAddress(h);
  }

  return false;
}

/**
 * Validates a media reference string. Supports:
 * 1) Local paths starting with `/assets/` or `/uploads/news/` (blocks `..` traversal)
 * 2) External `https://` URLs (and `http://` if non-private host), blocking CSS-injection chars
 */
export function validateMediaUrlOrPath(
  rawUrl: string,
  fieldName: string
): string {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.length > 2048) {
    throw new Error(`Invalid media link in "${fieldName}".`);
  }

  // Block characters that could break out of CSS url('...') or HTML attributes
  if (/['"()\\<>`\s;]/.test(trimmed)) {
    throw new Error(
      `Unsafe characters detected in "${fieldName}". Quotes, parentheses, and spaces are not allowed.`
    );
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

  if (parsed.username || parsed.password) {
    throw new Error(`Credentials inside URLs are not allowed in "${fieldName}".`);
  }

  if (isPrivateOrInternalHost(parsed.hostname)) {
    throw new Error(
      `Internal or private network host "${parsed.hostname}" is not allowed in "${fieldName}".`
    );
  }

  return parsed.toString();
}

/**
 * Resolves DNS for an external hostname and ensures none of its A/AAAA records
 * point to private/loopback/internal IP addresses (defeats DNS Rebinding SSRF).
 */
async function assertHostResolvesToPublicIp(hostname: string): Promise<void> {
  const cleanHost = hostname.replace(/^\[|\]$/g, "");
  if (isPrivateOrInternalHost(cleanHost)) {
    throw new Error(`Blocked internal host "${cleanHost}".`);
  }
  if (net.isIP(cleanHost)) {
    return;
  }

  const records = await dns.lookup(cleanHost, { all: true });
  if (!records || records.length === 0) {
    throw new Error(`Could not resolve hostname "${cleanHost}".`);
  }

  for (const rec of records) {
    if (isPrivateIpAddress(rec.address)) {
      throw new Error(
        `Hostname "${cleanHost}" resolves to a restricted private/internal IP address.`
      );
    }
  }
}

/**
 * Reads a fetch Response body stream up to `maxBytes`, aborting immediately if
 * the stream exceeds the limit (prevents Out-Of-Memory DoS from huge files).
 */
async function readResponseWithSizeLimit(
  response: Response,
  maxBytes: number
): Promise<Buffer> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error(
      `Remote file Content-Length (${Math.round(Number(contentLength) / (1024 * 1024))} MB) exceeds maximum limit.`
    );
  }

  if (!response.body) {
    throw new Error("Remote media response body is empty.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error(
          `Remote file exceeds maximum allowed size (${Math.round(maxBytes / (1024 * 1024))} MB).`
        );
      }
      chunks.push(value);
    }
  }

  return Buffer.concat(chunks, totalBytes);
}

/**
 * Safely downloads an external media URL (validating DNS and redirects at every
 * hop to prevent SSRF), enforces streaming byte limits, verifies Magic Bytes,
 * and saves a local copy into `/uploads/news/`.
 */
export async function downloadAndSaveExternalMedia(
  externalUrl: string,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  let currentUrl = validateMediaUrlOrPath(externalUrl, "mediaUrl");
  if (currentUrl.startsWith("/")) {
    throw new Error("URL is already a local path.");
  }

  const maxBytes =
    expectedKind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    let response: Response | null = null;

    // Follow up to 3 redirects manually, validating every hop against SSRF
    for (let hop = 0; hop <= 3; hop++) {
      const parsed = new URL(currentUrl);
      await assertHostResolvesToPublicIp(parsed.hostname);

      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.get("location")
      ) {
        if (hop === 3) {
          throw new Error("Too many redirects while fetching remote media.");
        }
        const location = response.headers.get("location")!;
        const resolvedRedirect = new URL(location, currentUrl).toString();
        currentUrl = validateMediaUrlOrPath(resolvedRedirect, "redirectUrl");
        continue;
      }

      break;
    }

    if (!response || !response.ok) {
      throw new Error(
        `Failed to fetch remote media (${response?.status || "unknown"}).`
      );
    }

    const buf = await readResponseWithSizeLimit(response, maxBytes);
    return await saveUploadedMediaBuffer(buf, expectedKind);
  } finally {
    clearTimeout(timeout);
  }
}
