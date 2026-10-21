import { NextRequest, NextResponse } from "next/server";
import { verifyNewsWriteAuth, withSecurityHeaders } from "@/lib/newsAuth";
import {
  downloadAndSaveExternalMedia,
  saveUploadedMediaBuffer,
  type SavedMediaAsset,
} from "@/lib/mediaUpload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // 1. JSON mode: download & mirror an external media URL into /uploads/news/
  if (contentType.includes("application/json")) {
    const rawBody = await req.text();
    const auth = verifyNewsWriteAuth(req, rawBody);
    if (!auth.ok && auth.response) {
      return withSecurityHeaders(auth.response);
    }

    try {
      const body = JSON.parse(rawBody) as {
        url?: string;
        kind?: "image" | "video";
      };
      if (!body.url || typeof body.url !== "string") {
        return withSecurityHeaders(
          NextResponse.json(
            { error: 'Field "url" is required when calling upload with JSON.' },
            { status: 400 }
          )
        );
      }

      const saved = await downloadAndSaveExternalMedia(body.url, body.kind);
      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: true,
            url: saved.url,
            asset: saved,
          },
          { status: 201 }
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process media URL.";
      return withSecurityHeaders(
        NextResponse.json({ error: message }, { status: 400 })
      );
    }
  }

  // 2. Multipart/form-data mode: direct binary file upload(s)
  if (contentType.includes("multipart/form-data")) {
    // For multipart uploads, verify Bearer/API-Key or HMAC over empty/header payload
    const auth = verifyNewsWriteAuth(req, "");
    if (!auth.ok && auth.response) {
      return withSecurityHeaders(auth.response);
    }

    try {
      const formData = await req.formData();
      const uploadedAssets: SavedMediaAsset[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          const expectedKind =
            key.toLowerCase().includes("video")
              ? "video"
              : key.toLowerCase().includes("image")
                ? "image"
                : undefined;
          const arrayBuffer = await value.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const saved = await saveUploadedMediaBuffer(buffer, expectedKind);
          uploadedAssets.push(saved);
        }
      }

      if (uploadedAssets.length === 0) {
        return withSecurityHeaders(
          NextResponse.json(
            {
              error:
                'No valid media file found in form-data. Attach a file under "file", "image", or "video".',
            },
            { status: 400 }
          )
        );
      }

      return withSecurityHeaders(
        NextResponse.json(
          {
            ok: true,
            url: uploadedAssets[0].url,
            asset: uploadedAssets[0],
            uploaded: uploadedAssets,
          },
          { status: 201 }
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload media file.";
      return withSecurityHeaders(
        NextResponse.json({ error: message }, { status: 400 })
      );
    }
  }

  return withSecurityHeaders(
    NextResponse.json(
      {
        error:
          "Unsupported Content-Type. Use multipart/form-data for file upload or application/json with { url }.",
      },
      { status: 415 }
    )
  );
}
