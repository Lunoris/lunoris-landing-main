import { NextRequest, NextResponse } from "next/server";
import {
  readAuthenticatedFormData,
  readAuthenticatedJsonText,
  withSecurityHeaders,
} from "@/lib/newsAuth";
import {
  downloadAndSaveExternalMedia,
  MediaValidationError,
  saveUploadedFileObject,
  type SavedMediaAsset,
} from "@/lib/mediaUpload";
import { isClientValidationError, isPlainObject } from "@/lib/newsValidator";

export const runtime = "nodejs";

const MAX_UPLOAD_JSON_BYTES = 16 * 1024; // 16 KB
const MAX_FILES_PER_UPLOAD = 20;

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  // 1. JSON mode: download & mirror an external media URL
  if (contentType.includes("application/json")) {
    const bodyResult = await readAuthenticatedJsonText(req, MAX_UPLOAD_JSON_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(bodyResult.rawBody);
    } catch {
      return withSecurityHeaders(
        NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
      );
    }

    if (!isPlainObject(parsed)) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Request body must be a JSON object." },
          { status: 400 }
        )
      );
    }

    try {
      const url = typeof parsed.url === "string" ? parsed.url : "";
      const kind =
        parsed.kind === "image" || parsed.kind === "video"
          ? parsed.kind
          : undefined;

      if (!url) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: 'Field "url" is required when calling upload with JSON.' },
            { status: 400 }
          )
        );
      }

      const saved = await downloadAndSaveExternalMedia(url, kind);
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
      if (isClientValidationError(err)) {
        return withSecurityHeaders(
          NextResponse.json({ error: err.message }, { status: err.statusCode })
        );
      }
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Failed to process media URL." },
          { status: 500 }
        )
      );
    }
  }

  // 2. Multipart/form-data mode: direct binary file upload(s)
  if (contentType.includes("multipart/form-data")) {
    const formResult = await readAuthenticatedFormData(req);
    if (!formResult.ok) {
      return formResult.response;
    }

    try {
      const { formData } = formResult;
      const uploadedAssets: SavedMediaAsset[] = [];

      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          if (uploadedAssets.length >= MAX_FILES_PER_UPLOAD) {
            throw new MediaValidationError(
              `Too many files in a single upload request (maximum ${MAX_FILES_PER_UPLOAD}).`
            );
          }
          const expectedKind = key.toLowerCase().includes("video")
            ? "video"
            : key.toLowerCase().includes("image")
              ? "image"
              : undefined;
          const saved = await saveUploadedFileObject(value, expectedKind);
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
      if (isClientValidationError(err)) {
        return withSecurityHeaders(
          NextResponse.json({ error: err.message }, { status: err.statusCode })
        );
      }
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Failed to upload media file." },
          { status: 500 }
        )
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
