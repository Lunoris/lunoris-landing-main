import crypto from "crypto";
import dns from "dns/promises";
import fs from "fs/promises";
import http from "http";
import https from "https";
import net from "net";
import path from "path";
import { put } from "@vercel/blob";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024; // 60 MB

export class MediaValidationError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "MediaValidationError";
    this.statusCode = statusCode;
  }
}

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

export const LOCAL_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "data",
  "uploads",
  "news"
);
export const LEGACY_PUBLIC_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "public",
  "uploads",
  "news"
);

/**
 * Validates binary buffer magic bytes, enforces size limits, and stores the file in Vercel Blob
 * (`news/media/<timestamp>-<hash>.<ext>`), or without a Blob token atomically into `data/uploads/news/`.
 */
export async function saveUploadedMediaBuffer(
  buf: Buffer,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  if (buf.length === 0) {
    throw new MediaValidationError("Uploaded media file is empty.");
  }

  const detected = detectMediaMagicBytes(buf);
  if (!detected) {
    throw new MediaValidationError(
      "Unsupported or unsafe media file format. Allowed formats (verified by binary signature): JPG, PNG, WEBP, AVIF, MP4, WEBM."
    );
  }

  if (expectedKind && detected.kind !== expectedKind) {
    throw new MediaValidationError(
      `Expected a ${expectedKind} file, but received ${detected.mime}.`
    );
  }

  const maxBytes =
    detected.kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (buf.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new MediaValidationError(
      `File exceeds maximum allowed size for ${detected.kind} (${maxMb} MB).`,
      413
    );
  }

  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
  const shortHash = sha256.slice(0, 16);
  const filename = `${Date.now()}-${shortHash}.${detected.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`news/media/${filename}`, buf, {
      access: "public",
      contentType: detected.mime,
      allowOverwrite: true,
    });
    return {
      url: blob.url,
      filename,
      mime: detected.mime,
      kind: detected.kind,
      size: buf.length,
      sha256,
    };
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const targetPath = path.join(LOCAL_UPLOAD_DIR, filename);
  const tempPath = `${targetPath}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`;

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
    throw new MediaValidationError("Uploaded media file is empty.");
  }

  const ceilingBytes =
    expectedKind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > ceilingBytes) {
    const maxMb = Math.round(ceilingBytes / (1024 * 1024));
    throw new MediaValidationError(
      `File exceeds maximum allowed size (${maxMb} MB).`,
      413
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  return saveUploadedMediaBuffer(buf, expectedKind);
}

function isPrivateIpv4Octets(
  a: number,
  b: number,
  c: number,
  _d: number
): boolean {
  if (a === 0 || a === 10 || a === 127) return true; // Current network, RFC1918, Loopback
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
  if (a === 169 && b === 254) return true; // Link-local / Cloud metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918 172.16.0.0/12
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true; // IETF 192.0.0.0/24 & TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return true; // 6to4 Relay Anycast
  if (a === 192 && b === 168) return true; // RFC1918 192.168.0.0/16
  if (a === 198 && (b === 18 || b === 19)) return true; // Benchmarking 198.18.0.0/15
  if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
  if (a >= 224) return true; // Multicast 224/4 & Reserved/Broadcast 240/4
  return false;
}

function isPrivateIpv4Words(hi16: number, lo16: number): boolean {
  return isPrivateIpv4Octets(
    (hi16 >>> 8) & 0xff,
    hi16 & 0xff,
    (lo16 >>> 8) & 0xff,
    lo16 & 0xff
  );
}

/**
 * Parses a valid IPv6 literal into eight 16-bit big-endian words, supporting `::`
 * zero-compression and trailing dotted-quad IPv4 (`::ffff:127.0.0.1`).
 */
function parseIpv6Words(ip: string): Uint16Array | null {
  if (ip.includes("%")) return null;
  let working = ip;

  // Convert optional trailing dotted-quad IPv4 into two 16-bit hex groups
  const lastColon = working.lastIndexOf(":");
  if (lastColon !== -1 && working.indexOf(".", lastColon) !== -1) {
    const v4Part = working.slice(lastColon + 1);
    if (!net.isIPv4(v4Part)) return null;
    const octets = v4Part.split(".").map(Number);
    const hi = ((octets[0] << 8) | octets[1]).toString(16);
    const lo = ((octets[2] << 8) | octets[3]).toString(16);
    working = `${working.slice(0, lastColon + 1)}${hi}:${lo}`;
  }

  const doubleColonParts = working.split("::");
  if (doubleColonParts.length > 2) return null;

  const parseSide = (side: string): number[] | null => {
    if (!side) return [];
    const tokens = side.split(":");
    const nums: number[] = [];
    for (const tok of tokens) {
      if (!/^[0-9a-f]{1,4}$/i.test(tok)) return null;
      nums.push(parseInt(tok, 16));
    }
    return nums;
  };

  if (doubleColonParts.length === 1) {
    const groups = parseSide(doubleColonParts[0]);
    if (!groups || groups.length !== 8) return null;
    return Uint16Array.from(groups);
  }

  const left = parseSide(doubleColonParts[0]);
  const right = parseSide(doubleColonParts[1]);
  if (!left || !right || left.length + right.length >= 8) return null;

  const words = new Uint16Array(8);
  for (let i = 0; i < left.length; i++) {
    words[i] = left[i];
  }
  const rightOffset = 8 - right.length;
  for (let i = 0; i < right.length; i++) {
    words[rightOffset + i] = right[i];
  }
  return words;
}

/**
 * Checks whether an IPv4 or IPv6 address is private, loopback, link-local,
 * CGNAT, NAT64/6to4/Teredo/mapped-IPv4 internal, multicast, documentation, or unspecified.
 */
export function isPrivateIpAddress(ip: string): boolean {
  const normalized = ip.replace(/^\[|\]$/g, "").trim().toLowerCase();
  if (!normalized || normalized.includes("%")) {
    return true;
  }

  if (net.isIPv4(normalized)) {
    const [a, b, c, d] = normalized.split(".").map(Number);
    return isPrivateIpv4Octets(a, b, c, d);
  }

  if (net.isIPv6(normalized)) {
    const w = parseIpv6Words(normalized);
    if (!w) return true;

    const allZeroPrefix5 =
      w[0] === 0 && w[1] === 0 && w[2] === 0 && w[3] === 0 && w[4] === 0;

    // 1. Unspecified ::/128 or Loopback ::1/128
    if (allZeroPrefix5 && w[5] === 0 && w[6] === 0 && (w[7] === 0 || w[7] === 1)) {
      return true;
    }

    // 2. IPv4-mapped IPv6 ::ffff:0:0/96 (handles both ::ffff:127.0.0.1 and WHATWG ::ffff:7f00:1)
    if (allZeroPrefix5 && w[5] === 0xffff) {
      return isPrivateIpv4Words(w[6], w[7]);
    }

    // 3. SIIT IPv4-translated ::ffff:0:0:0/96
    if (
      w[0] === 0 &&
      w[1] === 0 &&
      w[2] === 0 &&
      w[3] === 0 &&
      w[4] === 0xffff &&
      w[5] === 0
    ) {
      return isPrivateIpv4Words(w[6], w[7]);
    }

    // 4. Deprecated IPv4-compatible ::/96
    if (allZeroPrefix5 && w[5] === 0) {
      return isPrivateIpv4Words(w[6], w[7]);
    }

    // 5. NAT64 Well-Known Prefix 64:ff9b::/96 & Local-Use 64:ff9b:1::/48
    if (w[0] === 0x0064 && w[1] === 0xff9b) {
      if (w[2] === 0x0001) return true;
      if (w[2] === 0 && w[3] === 0 && w[4] === 0 && w[5] === 0) {
        return isPrivateIpv4Words(w[6], w[7]);
      }
    }

    // 6. 6to4 2002::/16 (embeds IPv4 in w[1], w[2])
    if (w[0] === 0x2002) {
      return isPrivateIpv4Words(w[1], w[2]);
    }

    // 7. Unique Local fc00::/7, Link-Local fe80::/10 (fe80..febf), Site-Local fec0::/10, Multicast ff00::/8
    if ((w[0] & 0xfe00) === 0xfc00) return true;
    if ((w[0] & 0xffc0) === 0xfe80) return true;
    if ((w[0] & 0xffc0) === 0xfec0) return true;
    if ((w[0] & 0xff00) === 0xff00) return true;

    // 8. Discard-only 0100::/64
    if (w[0] === 0x0100 && w[1] === 0 && w[2] === 0 && w[3] === 0) {
      return true;
    }

    // 9. Special IETF 2001:: ranges (Teredo 2001:0::/32, Benchmarking 2001:2::/48, Orchidv2 2001:20::/28, Docs 2001:db8::/32)
    if (w[0] === 0x2001) {
      if (w[1] === 0x0000) return true;
      if (w[1] === 0x0002 && w[2] === 0x0000) return true;
      if ((w[1] & 0xfff0) === 0x0020) return true;
      if (w[1] === 0x0db8) return true;
    }

    return false;
  }

  return true;
}

/**
 * Checks whether a hostname is a private/loopback/internal address to prevent SSRF.
 */
export function isPrivateOrInternalHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase().trim().replace(/\.$/, "");
  if (
    !h ||
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".home.arpa") ||
    h.includes("%") ||
    // Block integer/hex/octal IPv4 encodings (e.g. 2130706433, 0x7f000001, 0177.0.0.1)
    /^(?:0x[0-9a-f]+|\d+)$/i.test(h) ||
    /^(?:0\d+|0x[0-9a-f]+)(?:\.(?:0\d+|0x[0-9a-f]+|\d+)){1,3}$/i.test(h)
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
    throw new MediaValidationError(`Invalid media link in "${fieldName}".`);
  }

  // Block characters that could break out of CSS url('...') or HTML attributes
  if (/['"()\\<>`\s;]/.test(trimmed)) {
    throw new MediaValidationError(
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
      throw new MediaValidationError(
        `Path traversal is not allowed in "${fieldName}".`
      );
    }
    if (
      !trimmed.startsWith("/assets/") &&
      !trimmed.startsWith("/uploads/news/")
    ) {
      throw new MediaValidationError(
        `Local path in "${fieldName}" must start with "/assets/" or "/uploads/news/".`
      );
    }
    if (!/^\/[a-zA-Z0-9/_.-]+$/.test(trimmed)) {
      throw new MediaValidationError(
        `Invalid characters in local path "${fieldName}".`
      );
    }
    return trimmed;
  }

  // Case 2: External URL
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new MediaValidationError(
      `Invalid URL in "${fieldName}". Provide a valid https:// URL or local /assets/ or /uploads/news/ path.`
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new MediaValidationError(
      `Unsupported URL protocol "${parsed.protocol}" in "${fieldName}". Only https:// (or http://) is allowed.`
    );
  }

  if (parsed.username || parsed.password) {
    throw new MediaValidationError(
      `Credentials inside URLs are not allowed in "${fieldName}".`
    );
  }

  if (isPrivateOrInternalHost(parsed.hostname)) {
    throw new MediaValidationError(
      `Internal or private network host "${parsed.hostname}" is not allowed in "${fieldName}".`
    );
  }

  return parsed.toString();
}

interface VerifiedPinnedAddress {
  address: string;
  family: 4 | 6;
}

/**
 * Resolves DNS once, validates EVERY returned A/AAAA record against `isPrivateIpAddress`,
 * and returns a verified public IP + family to pin the outbound TCP socket (eliminating DNS rebinding TOCTOU).
 */
async function resolveVerifiedPublicIp(
  hostname: string
): Promise<VerifiedPinnedAddress> {
  const cleanHost = hostname.replace(/^\[|\]$/g, "");
  if (isPrivateOrInternalHost(cleanHost)) {
    throw new MediaValidationError(`Blocked internal host "${cleanHost}".`);
  }

  const ipVersion = net.isIP(cleanHost);
  if (ipVersion === 4 || ipVersion === 6) {
    return { address: cleanHost, family: ipVersion };
  }

  let records: { address: string; family: number }[];
  try {
    records = await dns.lookup(cleanHost, { all: true, verbatim: true });
  } catch {
    throw new MediaValidationError(`Could not resolve hostname "${cleanHost}".`);
  }

  if (!records || records.length === 0) {
    throw new MediaValidationError(`Could not resolve hostname "${cleanHost}".`);
  }

  for (const rec of records) {
    if (isPrivateIpAddress(rec.address)) {
      throw new MediaValidationError(
        `Hostname "${cleanHost}" resolves to a restricted private/internal IP address.`
      );
    }
  }

  const chosen = records[0];
  return {
    address: chosen.address,
    family: chosen.family === 6 ? 6 : 4,
  };
}

interface SingleHopFetchResult {
  statusCode: number;
  location?: string;
  body?: Buffer;
}

function requestSingleHopPinned(
  parsedUrl: URL,
  pinned: VerifiedPinnedAddress,
  maxBytes: number,
  signal: AbortSignal
): Promise<SingleHopFetchResult> {
  return new Promise((resolve, reject) => {
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const req = transport.request(
      parsedUrl,
      {
        method: "GET",
        headers: {
          Accept: "image/*,video/*;q=0.9,*/*;q=0.5",
          "User-Agent": "LunorisMediaMirror/1.0",
        },
        ...(isHttps ? { servername: parsedUrl.hostname } : {}),
        lookup: (_hostname, _opts, callback) => {
          callback(null, pinned.address, pinned.family);
        },
        signal,
      },
      (res) => {
        const statusCode = res.statusCode ?? 0;
        const rawLocation = res.headers.location;
        const location = Array.isArray(rawLocation)
          ? rawLocation[0]
          : rawLocation;

        if (statusCode >= 300 && statusCode < 400 && location) {
          res.resume();
          resolve({ statusCode, location });
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          reject(
            new MediaValidationError(
              `Failed to fetch remote media (HTTP ${statusCode || "unknown"}).`
            )
          );
          return;
        }

        const contentLengthHeader = res.headers["content-length"];
        if (contentLengthHeader) {
          const declaredBytes = Number(contentLengthHeader);
          if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) {
            req.destroy();
            reject(
              new MediaValidationError(
                `Remote file Content-Length (${Math.round(declaredBytes / (1024 * 1024))} MB) exceeds maximum limit.`,
                413
              )
            );
            return;
          }
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;

        res.on("data", (chunk: Buffer) => {
          totalBytes += chunk.byteLength;
          if (totalBytes > maxBytes) {
            req.destroy(
              new MediaValidationError(
                `Remote file exceeds maximum allowed size (${Math.round(maxBytes / (1024 * 1024))} MB).`,
                413
              )
            );
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          if (totalBytes === 0) {
            reject(new MediaValidationError("Remote media response body is empty."));
            return;
          }
          resolve({
            statusCode,
            body: Buffer.concat(chunks, totalBytes),
          });
        });

        res.on("error", (err) => {
          reject(err);
        });
      }
    );

    req.on("error", (err) => {
      if (err instanceof MediaValidationError) {
        reject(err);
      } else if (signal.aborted) {
        reject(new MediaValidationError("Remote media download timed out."));
      } else {
        reject(new MediaValidationError("Failed to connect to remote media host."));
      }
    });

    req.end();
  });
}

/**
 * Safely downloads an external media URL (pinning verified DNS IPs on every hop
 * to defeat DNS Rebinding SSRF), enforces streaming byte limits, verifies Magic Bytes,
 * and saves an atomic copy into Vercel Blob or `data/uploads/news/`.
 */
export async function downloadAndSaveExternalMedia(
  externalUrl: string,
  expectedKind?: "image" | "video"
): Promise<SavedMediaAsset> {
  let currentUrl = validateMediaUrlOrPath(externalUrl, "mediaUrl");
  if (currentUrl.startsWith("/")) {
    throw new MediaValidationError("URL is already a local path.");
  }

  const maxBytes =
    expectedKind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    for (let hop = 0; hop <= 3; hop++) {
      const parsed = new URL(currentUrl);
      const pinned = await resolveVerifiedPublicIp(parsed.hostname);
      const result = await requestSingleHopPinned(
        parsed,
        pinned,
        maxBytes,
        controller.signal
      );

      if (result.location) {
        if (hop === 3) {
          throw new MediaValidationError(
            "Too many redirects while fetching remote media."
          );
        }
        const resolvedRedirect = new URL(result.location, currentUrl).toString();
        currentUrl = validateMediaUrlOrPath(resolvedRedirect, "redirectUrl");
        continue;
      }

      if (!result.body) {
        throw new MediaValidationError("Remote media response body is empty.");
      }

      return await saveUploadedMediaBuffer(result.body, expectedKind);
    }

    throw new MediaValidationError("Failed to fetch remote media.");
  } finally {
    clearTimeout(timeout);
  }
}
