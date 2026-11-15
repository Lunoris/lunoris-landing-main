import crypto from "crypto";
import net from "net";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REPLAY_WINDOW_SECONDS = 300; // 5 minutes
const AUTH_FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_AUTH_FAILURES_PER_IP = 5;
const MAX_GLOBAL_AUTH_FAILURES = 20;
const WRITE_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_WRITES_PER_HOUR = 40;
const MAX_TRACKED_IPS = 2000;

export const MAX_MULTIPART_BODY_BYTES = 80 * 1024 * 1024; // 80 MB ceiling (60 MB video + 15 MB image + metadata)

interface RateRecord {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
  writes: number;
  writeWindowStart: number;
}

const ipRateMap = new Map<string, RateRecord>();

let globalFailures = 0;
let globalFirstFailureAt = 0;
let globalBlockedUntil = 0;

const usedHmacSignatures = new Map<string, number>();

function pruneReplayCache(nowMs: number) {
  if (usedHmacSignatures.size < 200) return;
  for (const [key, expiresAt] of usedHmacSignatures.entries()) {
    if (expiresAt <= nowMs) {
      usedHmacSignatures.delete(key);
    }
  }
}

function cleanValidIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const candidate = raw.trim().replace(/^\[|\]$/g, "");
  return net.isIP(candidate) !== 0 ? candidate : null;
}

/**
 * Extracts client IP strictly from trusted platform headers so untrusted clients
 * cannot spoof `CF-Connecting-IP` or `X-Forwarded-For` to bypass allowlists or rate limits.
 */
export function getClientIp(req: NextRequest): string {
  // 1. Optional Cloudflare proxy mode (only when explicitly deployed behind Cloudflare)
  if (process.env.LUNORIS_TRUST_CF_IP === "true") {
    const cfIp = cleanValidIp(req.headers.get("cf-connecting-ip"));
    if (cfIp) return cfIp;
  }

  // 2. Vercel Edge runtime / Node serverless sets x-vercel-forwarded-for & x-real-ip from socket IP
  if (process.env.VERCEL === "1") {
    const vercelForwarded = req.headers.get("x-vercel-forwarded-for");
    if (vercelForwarded) {
      const first = cleanValidIp(vercelForwarded.split(",")[0]);
      if (first) return first;
    }
    const vercelRealIp = cleanValidIp(req.headers.get("x-real-ip"));
    if (vercelRealIp) return vercelRealIp;
  }

  // 3. Explicit reverse-proxy opt-in for self-hosted deployments (uses rightmost hop appended by proxy)
  if (process.env.LUNORIS_TRUST_PROXY === "true") {
    const realIp = cleanValidIp(req.headers.get("x-real-ip"));
    if (realIp) return realIp;

    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded.split(",");
      const lastHop = cleanValidIp(hops[hops.length - 1]);
      if (lastHop) return lastHop;
    }
  }

  return "127.0.0.1";
}

function getOrCreateRecord(ip: string, now: number): RateRecord {
  let rec = ipRateMap.get(ip);
  if (!rec) {
    if (ipRateMap.size >= MAX_TRACKED_IPS) {
      const oldestKey = ipRateMap.keys().next().value;
      if (oldestKey) ipRateMap.delete(oldestKey);
    }
    rec = {
      failures: 0,
      firstFailureAt: now,
      blockedUntil: 0,
      writes: 0,
      writeWindowStart: now,
    };
    ipRateMap.set(ip, rec);
  }
  if (now - rec.firstFailureAt > AUTH_FAIL_WINDOW_MS && rec.blockedUntil <= now) {
    rec.failures = 0;
    rec.firstFailureAt = now;
  }
  if (now - rec.writeWindowStart > WRITE_RATE_WINDOW_MS) {
    rec.writes = 0;
    rec.writeWindowStart = now;
  }
  return rec;
}

/**
 * Constant-time string comparison using SHA-256 digests so lengths always match
 * and timing attacks cannot leak secret length or characters.
 */
function safeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(hashA, hashB) && a.length === b.length;
}

export function computeHmacV2Signature(
  secret: string,
  timestamp: string,
  method: string,
  pathname: string,
  rawBody: string | Buffer = ""
): string {
  const bodySha256 = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("hex");
  const canonical = `v2.${timestamp}.${method.toUpperCase()}.${pathname}.${bodySha256}`;
  return crypto
    .createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest("hex")
    .toLowerCase();
}

export interface AuthVerificationOptions {
  /**
   * When true, permits the legacy `sha256=HMAC(secret, "<timestamp>.<rawBody>")` signature format
   * in addition to `v2=<hex>`. Enabled ONLY on `POST /api/team` for backward compatibility with Lunoris Wiki.
   */
  allowLegacyHmac?: boolean;
  /**
   * When false, does not increment write/failure counters (used for optional `?refresh=1` check on GET /api/team).
   */
  recordAttempt?: boolean;
}

export interface AuthVerificationResult {
  ok: boolean;
  response?: NextResponse;
  method?: "hmac" | "bearer";
}

function recordAuthFailure(record: RateRecord, now: number) {
  record.failures += 1;
  if (record.failures >= MAX_AUTH_FAILURES_PER_IP) {
    record.blockedUntil = now + AUTH_FAIL_WINDOW_MS;
  }

  if (globalFailures === 0) {
    globalFirstFailureAt = now;
  }
  globalFailures += 1;
  if (globalFailures >= MAX_GLOBAL_AUTH_FAILURES) {
    globalBlockedUntil = now + AUTH_FAIL_WINDOW_MS;
  }
}

interface PreBodyGateResult {
  ok: boolean;
  response?: NextResponse;
  now: number;
  record: RateRecord;
  configuredApiKey: string;
  configuredHmacSecret: string;
  hasHmacHeaders: boolean;
  timestampHeader: string;
  signatureHeader: string;
}

function checkAccessPreconditions(req: NextRequest): PreBodyGateResult {
  const now = Date.now();
  const ip = getClientIp(req);
  const record = getOrCreateRecord(ip, now);

  if (
    now - globalFirstFailureAt > AUTH_FAIL_WINDOW_MS &&
    globalBlockedUntil <= now
  ) {
    globalFailures = 0;
    globalFirstFailureAt = now;
  }

  // 1. Check per-IP or global brute-force lockout
  if (record.blockedUntil > now || globalBlockedUntil > now) {
    const unlockAt = Math.max(record.blockedUntil, globalBlockedUntil);
    const retryAfterSec = Math.ceil((unlockAt - now) / 1000);
    return {
      ok: false,
      now,
      record,
      configuredApiKey: "",
      configuredHmacSecret: "",
      hasHmacHeaders: false,
      timestampHeader: "",
      signatureHeader: "",
      response: NextResponse.json(
        {
          error: "Too many failed authentication attempts. Try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "Cache-Control": "no-store",
          },
        }
      ),
    };
  }

  // 2. Check optional IP Allowlist
  const allowedIpsRaw = process.env.LUNORIS_ALLOWED_IPS?.trim();
  if (allowedIpsRaw) {
    const allowedIps = allowedIpsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (allowedIps.length > 0 && !allowedIps.includes(ip)) {
      return {
        ok: false,
        now,
        record,
        configuredApiKey: "",
        configuredHmacSecret: "",
        hasHmacHeaders: false,
        timestampHeader: "",
        signatureHeader: "",
        response: NextResponse.json(
          { error: "Forbidden IP address." },
          { status: 403, headers: { "Cache-Control": "no-store" } }
        ),
      };
    }
  }

  // 3. Check write rate limit per hour
  if (record.writes >= MAX_WRITES_PER_HOUR) {
    return {
      ok: false,
      now,
      record,
      configuredApiKey: "",
      configuredHmacSecret: "",
      hasHmacHeaders: false,
      timestampHeader: "",
      signatureHeader: "",
      response: NextResponse.json(
        { error: "Write rate limit exceeded. Try again later." },
        { status: 429, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  const configuredApiKey = process.env.LUNORIS_NEWS_API_KEY?.trim() || "";
  const configuredHmacSecret =
    process.env.LUNORIS_NEWS_HMAC_SECRET?.trim() || configuredApiKey;

  if (configuredApiKey.length < 32 && configuredHmacSecret.length < 32) {
    return {
      ok: false,
      now,
      record,
      configuredApiKey,
      configuredHmacSecret,
      hasHmacHeaders: false,
      timestampHeader: "",
      signatureHeader: "",
      response: NextResponse.json(
        {
          error:
            "Server publishing credentials are not configured or are shorter than the minimum 32-character security requirement.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  const timestampHeader = req.headers.get("x-lunoris-timestamp")?.trim() || "";
  const signatureHeader = req.headers.get("x-lunoris-signature")?.trim() || "";
  const hasHmacHeaders = Boolean(timestampHeader && signatureHeader);

  return {
    ok: true,
    now,
    record,
    configuredApiKey,
    configuredHmacSecret,
    hasHmacHeaders,
    timestampHeader,
    signatureHeader,
  };
}

function isFreshTimestamp(timestampHeader: string, nowMs: number): boolean {
  if (!/^\d{9,16}$/.test(timestampHeader)) return false;
  const rawTs = Number(timestampHeader);
  if (!Number.isFinite(rawTs)) return false;
  const tsSeconds = rawTs > 1e11 ? Math.floor(rawTs / 1000) : rawTs;
  const nowSeconds = Math.floor(nowMs / 1000);
  return Math.abs(nowSeconds - tsSeconds) <= REPLAY_WINDOW_SECONDS;
}

export function hasAuthCredentialsHeader(req: NextRequest): boolean {
  return Boolean(
    req.headers.get("authorization")?.trim() ||
      req.headers.get("x-api-key")?.trim() ||
      (req.headers.get("x-lunoris-timestamp")?.trim() &&
        req.headers.get("x-lunoris-signature")?.trim())
  );
}

/**
 * Verifies that a write request is authorized via either:
 * 1) HMAC-SHA256 v2 (`X-Lunoris-Timestamp` + `X-Lunoris-Signature: v2=<hex>`, bound to method, path & body hash)
 *    — or legacy `sha256=<hex>` ONLY when `options.allowLegacyHmac === true`
 * 2) Bearer API Key (`Authorization: Bearer <key>` or `X-Api-Key: <key>`)
 */
export function verifyNewsWriteAuth(
  req: NextRequest,
  rawBodyForHmac: string | Buffer = "",
  options?: AuthVerificationOptions
): AuthVerificationResult {
  const pre = checkAccessPreconditions(req);
  if (!pre.ok) {
    return { ok: false, response: pre.response };
  }

  const shouldRecord = options?.recordAttempt !== false;
  const allowLegacy = options?.allowLegacyHmac === true;
  const {
    now,
    record,
    configuredApiKey,
    configuredHmacSecret,
    hasHmacHeaders,
    timestampHeader,
    signatureHeader,
  } = pre;

  // 4A. Try HMAC-SHA256 verification if headers are present
  if (hasHmacHeaders && configuredHmacSecret.length >= 32) {
    if (isFreshTimestamp(timestampHeader, now)) {
      const lowerSigHeader = signatureHeader.toLowerCase();
      const isV2 = lowerSigHeader.startsWith("v2=");
      const isLegacyHeader =
        lowerSigHeader.startsWith("sha256=") || /^[0-9a-f]{64}$/.test(lowerSigHeader);

      if (isV2) {
        const providedHex = lowerSigHeader.slice(3);
        const replayKey = `v2:${timestampHeader}:${providedHex}`;
        const alreadyUsedAt = usedHmacSignatures.get(replayKey);
        const isReplayed = alreadyUsedAt !== undefined && alreadyUsedAt > now;

        if (!isReplayed && /^[0-9a-f]{64}$/.test(providedHex)) {
          const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;
          const expectedHex = computeHmacV2Signature(
            configuredHmacSecret,
            timestampHeader,
            req.method,
            pathname,
            rawBodyForHmac
          );

          if (safeCompareStrings(providedHex, expectedHex)) {
            pruneReplayCache(now);
            usedHmacSignatures.set(
              replayKey,
              now + REPLAY_WINDOW_SECONDS * 2 * 1000
            );
            if (shouldRecord) {
              record.failures = 0;
              record.writes += 1;
            }
            return { ok: true, method: "hmac" };
          }
        }
      } else if (allowLegacy && isLegacyHeader) {
        const providedHex = lowerSigHeader.replace(/^sha256=/, "");
        const replayKey = `v1:${timestampHeader}:${providedHex}`;
        const alreadyUsedAt = usedHmacSignatures.get(replayKey);
        const isReplayed = alreadyUsedAt !== undefined && alreadyUsedAt > now;

        if (!isReplayed && /^[0-9a-f]{64}$/.test(providedHex)) {
          const hmac = crypto.createHmac("sha256", configuredHmacSecret);
          hmac.update(`${timestampHeader}.`, "utf8");
          hmac.update(rawBodyForHmac);
          const expectedHex = hmac.digest("hex").toLowerCase();

          if (safeCompareStrings(providedHex, expectedHex)) {
            pruneReplayCache(now);
            usedHmacSignatures.set(
              replayKey,
              now + REPLAY_WINDOW_SECONDS * 2 * 1000
            );
            if (shouldRecord) {
              record.failures = 0;
              record.writes += 1;
            }
            return { ok: true, method: "hmac" };
          }
        }
      }
    }
  }

  // 4B. Try Bearer Token or X-Api-Key verification
  const authHeader = req.headers.get("authorization")?.trim() || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const xApiKey = req.headers.get("x-api-key")?.trim() || "";
  const candidateKey = bearerToken || xApiKey;

  if (
    candidateKey &&
    configuredApiKey.length >= 32 &&
    safeCompareStrings(candidateKey, configuredApiKey)
  ) {
    if (shouldRecord) {
      record.failures = 0;
      record.writes += 1;
    }
    return { ok: true, method: "bearer" };
  }

  if (shouldRecord) {
    recordAuthFailure(record, now);
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: "Unauthorized. Valid Bearer key or HMAC v2 signature required." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    ),
  };
}

export function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

async function readBoundedRequestBuffer(
  req: NextRequest,
  maxBytes: number,
  limitLabel: string,
  options?: AuthVerificationOptions
): Promise<{ ok: true; rawBuffer: Buffer } | { ok: false; response: NextResponse }> {
  // 1. Run lockout, IP allowlist, rate-limit, and secret checks BEFORE reading a single byte of body
  const pre = checkAccessPreconditions(req);
  if (!pre.ok && pre.response) {
    return { ok: false, response: withSecurityHeaders(pre.response) };
  }

  // 2. Enforce Content-Length header ceiling upfront
  const contentLengthHeader = req.headers.get("content-length");
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isFinite(contentLength) || contentLength < 0) {
      return {
        ok: false,
        response: withSecurityHeaders(
          NextResponse.json(
            { error: "Invalid Content-Length header." },
            { status: 400, headers: { "Cache-Control": "no-store" } }
          )
        ),
      };
    }
    if (contentLength > maxBytes) {
      return {
        ok: false,
        response: withSecurityHeaders(
          NextResponse.json(
            { error: `Request body exceeds ${limitLabel} limit.` },
            { status: 413, headers: { "Cache-Control": "no-store" } }
          )
        ),
      };
    }
  }

  const hasBearerCandidate = Boolean(
    req.headers.get("authorization")?.trim() ||
      req.headers.get("x-api-key")?.trim()
  );

  // 3. If no HMAC headers are supplied, verify Bearer key BEFORE reading the stream
  if (!pre.hasHmacHeaders) {
    const auth = verifyNewsWriteAuth(req, "", options);
    if (!auth.ok && auth.response) {
      return { ok: false, response: withSecurityHeaders(auth.response) };
    }
  } else if (!hasBearerCandidate) {
    // Validate HMAC timestamp window & signature format BEFORE buffering body stream
    const lowerSig = pre.signatureHeader.toLowerCase();
    const validFormat =
      /^v2=[0-9a-f]{64}$/.test(lowerSig) ||
      (options?.allowLegacyHmac === true &&
        (/^(?:sha256=)?[0-9a-f]{64}$/.test(lowerSig)));

    if (!isFreshTimestamp(pre.timestampHeader, pre.now) || !validFormat) {
      recordAuthFailure(pre.record, pre.now);
      return {
        ok: false,
        response: withSecurityHeaders(
          NextResponse.json(
            {
              error:
                "Unauthorized. Expired timestamp or invalid HMAC signature format.",
            },
            { status: 401, headers: { "Cache-Control": "no-store" } }
          )
        ),
      };
    }
  }

  if (!req.body) {
    const emptyBuf = Buffer.alloc(0);
    if (pre.hasHmacHeaders) {
      const auth = verifyNewsWriteAuth(req, emptyBuf, options);
      if (!auth.ok && auth.response) {
        return { ok: false, response: withSecurityHeaders(auth.response) };
      }
    }
    return { ok: true, rawBuffer: emptyBuf };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel();
          return {
            ok: false,
            response: withSecurityHeaders(
              NextResponse.json(
                { error: `Request body exceeds ${limitLabel} limit.` },
                { status: 413, headers: { "Cache-Control": "no-store" } }
              )
            ),
          };
        }
        chunks.push(value);
      }
    }
  } catch {
    return {
      ok: false,
      response: withSecurityHeaders(
        NextResponse.json(
          { error: "Failed to read request stream." },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        )
      ),
    };
  }

  const rawBuffer = Buffer.concat(chunks, totalBytes);

  if (pre.hasHmacHeaders) {
    const auth = verifyNewsWriteAuth(req, rawBuffer, options);
    if (!auth.ok && auth.response) {
      return { ok: false, response: withSecurityHeaders(auth.response) };
    }
  }

  return { ok: true, rawBuffer };
}

/**
 * Safely reads a JSON request body up to `maxBytes` ONLY after passing pre-body
 * lockout/IP/timestamp gates, then verifies HMAC over the exact body bytes.
 */
export async function readAuthenticatedJsonText(
  req: NextRequest,
  maxBytes = 256 * 1024,
  options?: AuthVerificationOptions
): Promise<{ ok: true; rawBody: string } | { ok: false; response: NextResponse }> {
  const limitLabel =
    maxBytes >= 1024 * 1024
      ? `${Math.round(maxBytes / (1024 * 1024))} MB`
      : `${Math.round(maxBytes / 1024)} KB`;

  const res = await readBoundedRequestBuffer(req, maxBytes, limitLabel, options);
  if (!res.ok) return res;
  return { ok: true, rawBody: res.rawBuffer.toString("utf8") };
}

/**
 * Safely reads and authenticates a `multipart/form-data` request up to `maxBytes`,
 * verifying either Bearer credentials or HMAC v2 over the exact multipart byte stream.
 */
export async function readAuthenticatedFormData(
  req: NextRequest,
  maxBytes = MAX_MULTIPART_BODY_BYTES,
  options?: AuthVerificationOptions
): Promise<{ ok: true; formData: FormData } | { ok: false; response: NextResponse }> {
  const limitLabel = `${Math.round(maxBytes / (1024 * 1024))} MB`;
  const res = await readBoundedRequestBuffer(req, maxBytes, limitLabel, options);
  if (!res.ok) return res;

  try {
    const syntheticReq = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: new Uint8Array(res.rawBuffer),
    });
    const formData = await syntheticReq.formData();
    return { ok: true, formData };
  } catch {
    return {
      ok: false,
      response: withSecurityHeaders(
        NextResponse.json(
          { error: "Malformed multipart/form-data payload." },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        )
      ),
    };
  }
}
