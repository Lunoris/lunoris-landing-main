import assert from "node:assert/strict";
import crypto from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  detectMediaMagicBytes,
  isPrivateIpAddress,
  isPrivateOrInternalHost,
  MediaValidationError,
  pinnedLookup,
  validateMediaUrlOrPath,
} from "@/lib/mediaUpload";
import {
  computeHmacV2Signature,
  getClientIp,
  verifyNewsWriteAuth,
} from "@/lib/newsAuth";
import {
  NewsValidationError,
  validateAndBuildNewsArticle,
} from "@/lib/newsValidator";

const TEST_SECRET = "lunoris_test_secret_key_with_at_least_32_chars_long!!";

function withEnv<T>(
  overrides: Record<string, string | undefined>,
  fn: () => T
): T {
  const previous: Record<string, string | undefined> = {};
  for (const [key, val] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (val === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = val;
    }
  }
  try {
    return fn();
  } finally {
    for (const [key, val] of Object.entries(previous)) {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    }
  }
}

describe("SSRF & IP validation (mediaUpload)", () => {
  it("blocks private, loopback, metadata, CGNAT, and multicast IPv4 addresses", () => {
    const blockedV4 = [
      "0.0.0.0",
      "10.0.0.1",
      "100.64.0.1",
      "100.127.255.254",
      "127.0.0.1",
      "127.255.255.254",
      "169.254.169.254",
      "172.16.0.1",
      "172.31.255.254",
      "192.0.2.1",
      "192.88.99.1",
      "192.168.1.50",
      "198.18.0.1",
      "224.0.0.1",
      "255.255.255.255",
    ];
    for (const ip of blockedV4) {
      assert.equal(isPrivateIpAddress(ip), true, `Expected ${ip} to be blocked`);
    }

    const publicV4 = ["1.1.1.1", "8.8.8.8", "93.184.216.34", "172.32.0.1", "100.128.0.1"];
    for (const ip of publicV4) {
      assert.equal(isPrivateIpAddress(ip), false, `Expected ${ip} to be allowed`);
    }
  });

  it("blocks IPv6 loopback, mapped-IPv4 hex/dotted, link-local fe80..febf, ULA, NAT64, 6to4, and Teredo", () => {
    const blockedV6 = [
      "::",
      "::1",
      "[::1]",
      "::ffff:127.0.0.1",
      "::ffff:7f00:1",
      "[::ffff:7f00:1]",
      "::ffff:a9fe:a9fe",
      "::ffff:0:127.0.0.1",
      "::127.0.0.1",
      "fe80::1",
      "fe9a::1",
      "febf::ffff",
      "fc00::1",
      "fd12:3456:789a::1",
      "fec0::1",
      "ff02::1",
      "64:ff9b::7f00:1",
      "64:ff9b::a9fe:a9fe",
      "64:ff9b:1::1",
      "2002:7f00:0001::1",
      "2002:a9fe:a9fe::1",
      "2001:0000:4136:e378:8000:63bf:3fff:fdd2",
      "2001:db8::1",
      "100::1",
    ];
    for (const ip of blockedV6) {
      assert.equal(isPrivateIpAddress(ip), true, `Expected ${ip} to be blocked`);
    }

    const publicV6 = [
      "2606:4700:4700::1111",
      "2001:4860:4860::8888",
      "::ffff:8.8.8.8",
      "::ffff:0808:0808",
      "64:ff9b::0808:0808",
      "2002:0808:0808::1",
    ];
    for (const ip of publicV6) {
      assert.equal(isPrivateIpAddress(ip), false, `Expected ${ip} to be allowed`);
    }
  });

  it("blocks internal hostnames and alternate IPv4 encodings", () => {
    const blockedHosts = [
      "localhost",
      "sub.localhost",
      "metadata.internal",
      "printer.local",
      "router.home.arpa",
      "2130706433",
      "0x7f000001",
      "0177.0.0.1",
      "[::ffff:7f00:1]",
    ];
    for (const host of blockedHosts) {
      assert.equal(
        isPrivateOrInternalHost(host),
        true,
        `Expected host ${host} to be blocked`
      );
    }
    assert.equal(isPrivateOrInternalHost("cdn.lunoris.com"), false);
  });

  it("validates local paths and external URLs while blocking traversal, CSS breakout, and SSRF URLs", () => {
    assert.equal(
      validateMediaUrlOrPath("/assets/dream-level-1.png", "coverImage"),
      "/assets/dream-level-1.png"
    );
    assert.equal(
      validateMediaUrlOrPath(
        "/uploads/news/1700000000-abcdef0123456789.webp",
        "coverImage"
      ),
      "/uploads/news/1700000000-abcdef0123456789.webp"
    );
    assert.equal(
      validateMediaUrlOrPath("https://cdn.lunoris.com/art/hero.png", "coverImage"),
      "https://cdn.lunoris.com/art/hero.png"
    );

    const invalidInputs = [
      "/assets/../etc/passwd",
      "//evil.example.com/payload.png",
      "/secret/file.png",
      "javascript:alert(1)",
      "https://cdn.lunoris.com/a');background:url(x)",
      "https://[::ffff:7f00:1]/secret.png",
      "http://169.254.169.254/latest/meta-data/",
    ];
    for (const bad of invalidInputs) {
      assert.throws(
        () => validateMediaUrlOrPath(bad, "coverImage"),
        MediaValidationError,
        `Expected ${bad} to throw MediaValidationError`
      );
    }
  });
});

describe("Binary Magic Bytes detection (mediaUpload)", () => {
  it("accepts genuine raster/video headers and rejects SVG/HTML polyglots", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);
    assert.deepEqual(detectMediaMagicBytes(png), {
      ext: "png",
      mime: "image/png",
      kind: "image",
    });

    const mp4 = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
    ]);
    assert.deepEqual(detectMediaMagicBytes(mp4), {
      ext: "mp4",
      mime: "video/mp4",
      kind: "video",
    });

    const svgXss = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
    assert.equal(detectMediaMagicBytes(svgXss), null);

    const html = Buffer.from("<!DOCTYPE html><html><body>xss</body></html>");
    assert.equal(detectMediaMagicBytes(html), null);
  });
});

describe("Client IP extraction & HMAC v2 authentication (newsAuth)", () => {
  it("ignores spoofed proxy headers unless trusted platform flags are enabled", () => {
    const spoofedReq = new NextRequest("https://lunoris.com/api/news", {
      headers: {
        "cf-connecting-ip": "203.0.113.9",
        "x-forwarded-for": "198.51.100.7, 198.51.100.8",
        "x-vercel-forwarded-for": "192.0.2.44",
      },
    });

    withEnv(
      {
        VERCEL: undefined,
        LUNORIS_TRUST_CF_IP: undefined,
        LUNORIS_TRUST_PROXY: undefined,
      },
      () => {
        assert.equal(getClientIp(spoofedReq), "127.0.0.1");
      }
    );

    withEnv(
      {
        VERCEL: "1",
        LUNORIS_TRUST_CF_IP: undefined,
        LUNORIS_TRUST_PROXY: undefined,
      },
      () => {
        assert.equal(getClientIp(spoofedReq), "192.0.2.44");
      }
    );

    withEnv(
      {
        VERCEL: undefined,
        LUNORIS_TRUST_CF_IP: "true",
        LUNORIS_TRUST_PROXY: undefined,
      },
      () => {
        assert.equal(getClientIp(spoofedReq), "203.0.113.9");
      }
    );

    withEnv(
      {
        VERCEL: undefined,
        LUNORIS_TRUST_CF_IP: undefined,
        LUNORIS_TRUST_PROXY: "true",
      },
      () => {
        assert.equal(getClientIp(spoofedReq), "198.51.100.8");
      }
    );
  });

  it("enforces HMAC v2 method/path/body binding, replay protection, and legacy opt-in", () => {
    withEnv(
      {
        LUNORIS_NEWS_API_KEY: TEST_SECRET,
        LUNORIS_NEWS_HMAC_SECRET: TEST_SECRET,
        LUNORIS_ALLOWED_IPS: undefined,
        VERCEL: undefined,
        LUNORIS_TRUST_CF_IP: undefined,
        LUNORIS_TRUST_PROXY: undefined,
      },
      () => {
        const ts = String(Math.floor(Date.now() / 1000));
        const body = JSON.stringify({ title: "Chronicle One" });
        const sig = computeHmacV2Signature(
          TEST_SECRET,
          ts,
          "POST",
          "/api/news",
          body
        );

        // 1. Valid HMAC v2 request succeeds
        const validReq = new NextRequest("https://lunoris.com/api/news", {
          method: "POST",
          headers: {
            "x-lunoris-timestamp": ts,
            "x-lunoris-signature": `v2=${sig}`,
          },
        });
        const firstCheck = verifyNewsWriteAuth(validReq, body);
        assert.equal(firstCheck.ok, true);
        assert.equal(firstCheck.method, "hmac");

        // 2. Exact replay of the same signature is rejected
        const replayCheck = verifyNewsWriteAuth(validReq, body, {
          recordAttempt: false,
        });
        assert.equal(replayCheck.ok, false);

        // 3. Cross-method / cross-path signature reuse (e.g. empty-body DELETE) is rejected
        const tsDelete = String(Math.floor(Date.now() / 1000));
        const postEmptySig = computeHmacV2Signature(
          TEST_SECRET,
          tsDelete,
          "POST",
          "/api/news",
          ""
        );
        const crossRouteDeleteReq = new NextRequest(
          "https://lunoris.com/api/news/target-article",
          {
            method: "DELETE",
            headers: {
              "x-lunoris-timestamp": tsDelete,
              "x-lunoris-signature": `v2=${postEmptySig}`,
            },
          }
        );
        assert.equal(
          verifyNewsWriteAuth(crossRouteDeleteReq, "", { recordAttempt: false })
            .ok,
          false
        );

        // 4. Legacy v1 HMAC is rejected on /api/news, but accepted when allowLegacyHmac: true (/api/team)
        const legacyBody = JSON.stringify({ members: [] });
        const legacyHex = crypto
          .createHmac("sha256", TEST_SECRET)
          .update(`${ts}.`, "utf8")
          .update(legacyBody)
          .digest("hex");
        const legacyReq = new NextRequest("https://lunoris.com/api/team", {
          method: "POST",
          headers: {
            "x-lunoris-timestamp": ts,
            "x-lunoris-signature": `sha256=${legacyHex}`,
          },
        });

        assert.equal(
          verifyNewsWriteAuth(legacyReq, legacyBody, {
            allowLegacyHmac: false,
            recordAttempt: false,
          }).ok,
          false
        );
        assert.equal(
          verifyNewsWriteAuth(legacyReq, legacyBody, {
            allowLegacyHmac: true,
            recordAttempt: false,
          }).ok,
          true
        );
      }
    );
  });
});

describe("News payload validation (newsValidator)", () => {
  it("validates well-formed articles and rejects malformed payloads with NewsValidationError", () => {
    const built = validateAndBuildNewsArticle({
      title: "Echoes of the Dream Hub",
      category: "World & Lore",
      excerpt: "A deep dive into Lunora's shifting apartment hub.",
      lead: "Every door inside the Dream Hub reflects an emotional threshold.",
      image: "/assets/dreamhub-scene.png",
      sections: [
        {
          heading: "The Seven Doors",
          paragraphs: [
            "As Lucid Orbs return to the apartment, warm light restores each room.",
          ],
        },
      ],
    });

    assert.equal(built.slug, "echoes-of-the-dream-hub");
    assert.equal(built.category, "World & Lore");
    assert.equal(built.sections.length, 1);

    assert.throws(
      () => validateAndBuildNewsArticle(["not-an-object"]),
      NewsValidationError
    );
    assert.throws(
      () =>
        validateAndBuildNewsArticle({
          title: "Bad Slug Test",
          slug: "../evil",
          category: "Update",
          excerpt: "Valid excerpt text here.",
          lead: "Valid lead paragraph text here.",
          image: "/assets/dreamhub-scene.png",
          sections: [{ heading: "Heading", paragraphs: ["Valid paragraph."] }],
        }),
      NewsValidationError
    );
  });
});

describe("Pinned DNS lookup for the media mirror (pinnedLookup)", () => {
  it("connects to the pinned address for a DNS hostname (Node 20+ asks lookup for all addresses)", async () => {
    const server = http.createServer((_req, res) => res.end("ok"));
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const { port } = server.address() as AddressInfo;
    try {
      const status = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          `http://media.example.test:${port}/`,
          { lookup: pinnedLookup({ address: "127.0.0.1", family: 4 }) },
          (res) => { res.resume(); resolve(res.statusCode ?? 0); }
        );
        req.on("error", reject);
        req.end();
      });
      assert.equal(status, 200);
    } finally {
      server.close();
    }
  });
});
