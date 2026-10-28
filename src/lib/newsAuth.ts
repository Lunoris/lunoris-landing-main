import crypto from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REPLAY_WINDOW_SECONDS = 300; // 5 minutes
const AUTH_FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_AUTH_FAILURES_PER_IP = 5;
const MAX_GLOBAL_AUTH_FAILURES = 20; // Protects against X-Forwarded-For IP spoofing
const WRITE_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_WRITES_PER_HOUR = 40;
const MAX_TRACKED_IPS = 2000; // Prevents memory exhaustion from spoofed headers

interface RateRecord {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
  writes: number;
  writeWindowStart: number;
}

const ipRateMap = new Map<string, RateRecord>();

// Global circuit breaker state to defeat header-spoofing brute force
let globalFailures = 0;
let globalFirstFailureAt = 0;
let globalBlockedUntil = 0;

// Replay cache for HMAC signatures (prevents reuse within the 5-minute window)
const usedHmacSignatures = new Map<string, number>();

function pruneReplayCache(nowMs: number) {
  if (usedHmacSignatures.size < 200) return;
  for (const [key, expiresAt] of usedHmacSignatures.entries()) {
    if (expiresAt <= nowMs) {
      usedHmacSignatures.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && /^[0-9a-fA-F:.,\s]{3,45}$/.test(cfIp)) return cfIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && /^[0-9a-fA-F:.]{3,45}$/.test(first)) return first;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && /^[0-9a-fA-F:.]{3,45}$/.test(realIp)) return realIp;

  return "127.0.0.1";
}

function getOrCreateRecord(ip: string, now: number): RateRecord {
  let rec = ipRateMap.get(ip);
  if (!rec) {
    // Evict oldest entries if map grows too large (DoS protection)
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

export interface AuthVerificationResult {
  ok: boolean;
  response?: NextResponse;
  method?: "hmac" | "bearer";
}

/**
 * Verifies that a write request to the News API is authorized via either:
 * 1) HMAC-SHA256 signature (`X-Lunoris-Timestamp` + `X-Lunoris-Signature`)
 * 2) Bearer API Key (`Authorization: Bearer <key>` or `X-Api-Key: <key>`)
 */
export function verifyNewsWriteAuth(
  req: NextRequest,
  rawBodyForHmac?: string | Buffer
): AuthVerificationResult {
  const now = Date.now();
  const ip = getClientIp(req);
  const record = getOrCreateRecord(ip, now);

  // Reset global failure window if expired
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
      response: NextResponse.json(
        { error: "Write rate limit exceeded. Try again later." },
        { status: 429, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  const configuredApiKey = process.env.LUNORIS_NEWS_API_KEY?.trim() || "";
  const configuredHmacSecret =
    process.env.LUNORIS_NEWS_HMAC_SECRET?.trim() || configuredApiKey;

  if (
    configuredApiKey.length < 32 &&
    configuredHmacSecret.length < 32
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Server publishing credentials are not configured or are shorter than the minimum 32-character security requirement.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  // 4A. Try HMAC-SHA256 verification if headers are present
  const timestampHeader = req.headers.get("x-lunoris-timestamp")?.trim();
  const signatureHeader = req.headers.get("x-lunoris-signature")?.trim();

  if (
    timestampHeader &&
    signatureHeader &&
    configuredHmacSecret.length >= 32
  ) {
    const rawTs = Number(timestampHeader);
    // Support both unix_seconds (~1.7e9) and unix_ms (~1.7e12)
    const tsSeconds = rawTs > 1e11 ? Math.floor(rawTs / 1000) : rawTs;
    const nowSeconds = Math.floor(now / 1000);

    if (
      Number.isFinite(rawTs) &&
      Math.abs(nowSeconds - tsSeconds) <= REPLAY_WINDOW_SECONDS
    ) {
      const normalizedSig = signatureHeader
        .replace(/^sha256=/i, "")
        .toLowerCase();
      const replayKey = `${timestampHeader}:${normalizedSig}`;

      // Reject replayed HMAC signatures within the 5-minute window unless Bearer token is also valid
      const alreadyUsedAt = usedHmacSignatures.get(replayKey);
      const isReplayed = alreadyUsedAt !== undefined && alreadyUsedAt > now;

      if (!isReplayed) {
        const hmac = crypto.createHmac("sha256", configuredHmacSecret);
        hmac.update(`${timestampHeader}.`, "utf8");
        if (rawBodyForHmac !== undefined) {
          hmac.update(rawBodyForHmac);
        }
        const expectedHex = hmac.digest("hex").toLowerCase();

        if (safeCompareStrings(normalizedSig, expectedHex)) {
          pruneReplayCache(now);
          usedHmacSignatures.set(
            replayKey,
            now + REPLAY_WINDOW_SECONDS * 2 * 1000
          );
          record.failures = 0;
          record.writes += 1;
          return { ok: true, method: "hmac" };
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
    record.failures = 0;
    record.writes += 1;
    return { ok: true, method: "bearer" };
  }

  // Authentication failed: increment per-IP and global brute-force counters
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

  return {
    ok: false,
    response: NextResponse.json(
      { error: "Unauthorized. Valid Bearer key or HMAC signature required." },
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

/**
 * Safely reads a JSON request body up to `maxBytes` ONLY after verifying
 * that authentication headers are present (and pre-validating Bearer token or
 * HMAC timestamp/rate-limits before buffering the stream). Prevents unauthenticated
 * Out-Of-Memory (OOM) DoS via large request streams.
 */
export async function readAuthenticatedJsonText(
  req: NextRequest,
  maxBytes = 256 * 1024
): Promise<{ ok: true; rawBody: string } | { ok: false; response: NextResponse }> {
  const hasHmacHeaders = Boolean(
    req.headers.get("x-lunoris-timestamp")?.trim() &&
      req.headers.get("x-lunoris-signature")?.trim()
  );

  // If not using body-dependent HMAC, verify Bearer / X-Api-Key BEFORE reading a single byte of the body
  if (!hasHmacHeaders) {
    const auth = verifyNewsWriteAuth(req, "");
    if (!auth.ok && auth.response) {
      return { ok: false, response: withSecurityHeaders(auth.response) };
    }
  } else {
    // Even for HMAC, reject immediately if Content-Length header exceeds limit
    const contentLength = Number(req.headers.get("content-length") || "0");
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      return {
        ok: false,
        response: withSecurityHeaders(
          NextResponse.json(
            {
              error: `Request JSON body exceeds ${Math.round(maxBytes / 1024)} KB limit.`,
            },
            { status: 413, headers: { "Cache-Control": "no-store" } }
          )
        ),
      };
    }
  }

  // Stream the body with a strict byte ceiling so large payloads abort immediately
  if (!req.body) {
    if (hasHmacHeaders) {
      const auth = verifyNewsWriteAuth(req, "");
      if (!auth.ok && auth.response) {
        return { ok: false, response: withSecurityHeaders(auth.response) };
      }
    }
    return { ok: true, rawBody: "" };
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
                {
                  error: `Request JSON body exceeds ${Math.round(maxBytes / 1024)} KB limit.`,
                },
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

  const rawBody = Buffer.concat(chunks, totalBytes).toString("utf8");

  if (hasHmacHeaders) {
    const auth = verifyNewsWriteAuth(req, rawBody);
    if (!auth.ok && auth.response) {
      return { ok: false, response: withSecurityHeaders(auth.response) };
    }
  }

  return { ok: true, rawBody };
}
