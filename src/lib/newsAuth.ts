import crypto from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REPLAY_WINDOW_SECONDS = 300; // 5 minutes
const AUTH_FAIL_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_AUTH_FAILURES = 5;
const WRITE_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_WRITES_PER_HOUR = 40;

interface RateRecord {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
  writes: number;
  writeWindowStart: number;
}

const ipRateMap = new Map<string, RateRecord>();

export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

function getOrCreateRecord(ip: string, now: number): RateRecord {
  let rec = ipRateMap.get(ip);
  if (!rec) {
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

  // 1. Check temporary brute-force lockout
  if (record.blockedUntil > now) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
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

  if (!configuredApiKey && !configuredHmacSecret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Server publishing credentials are not configured. Set LUNORIS_NEWS_API_KEY or LUNORIS_NEWS_HMAC_SECRET in .env.local.",
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  // 4A. Try HMAC-SHA256 verification if headers are present
  const timestampHeader = req.headers.get("x-lunoris-timestamp")?.trim();
  const signatureHeader = req.headers.get("x-lunoris-signature")?.trim();

  if (timestampHeader && signatureHeader && configuredHmacSecret) {
    const tsSeconds = Number(timestampHeader);
    const nowSeconds = Math.floor(now / 1000);

    if (
      Number.isFinite(tsSeconds) &&
      Math.abs(nowSeconds - tsSeconds) <= REPLAY_WINDOW_SECONDS
    ) {
      const normalizedSig = signatureHeader.replace(/^sha256=/i, "");
      const hmac = crypto.createHmac("sha256", configuredHmacSecret);
      hmac.update(`${tsSeconds}.`, "utf8");
      if (rawBodyForHmac !== undefined) {
        hmac.update(rawBodyForHmac);
      }
      const expectedHex = hmac.digest("hex");

      if (safeCompareStrings(normalizedSig.toLowerCase(), expectedHex.toLowerCase())) {
        record.failures = 0;
        record.writes += 1;
        return { ok: true, method: "hmac" };
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

  if (candidateKey && configuredApiKey && safeCompareStrings(candidateKey, configuredApiKey)) {
    record.failures = 0;
    record.writes += 1;
    return { ok: true, method: "bearer" };
  }

  // Authentication failed: increment brute-force counter
  record.failures += 1;
  if (record.failures >= MAX_AUTH_FAILURES) {
    record.blockedUntil = now + AUTH_FAIL_WINDOW_MS;
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
