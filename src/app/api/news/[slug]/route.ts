import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyNewsWriteAuth, withSecurityHeaders } from "@/lib/newsAuth";
import {
  downloadAndSaveExternalMedia,
  saveUploadedMediaBuffer,
} from "@/lib/mediaUpload";
import {
  validateAndBuildNewsArticle,
  validateSlug,
} from "@/lib/newsValidator";
import {
  deleteNewsBySlug,
  getNewsBySlug,
  upsertNewsArticle,
} from "@/lib/newsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_JSON_BODY_BYTES = 256 * 1024; // 256 KB

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const safeSlug = validateSlug(slug);
    const article = await getNewsBySlug(safeSlug);

    if (!article) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Article not found." }, { status: 404 })
      );
    }

    return withSecurityHeaders(
      NextResponse.json(
        { ok: true, article },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid slug.";
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 400 })
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const safeSlug = validateSlug(slug);
    const existing = await getNewsBySlug(safeSlug);

    if (!existing) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Article not found." }, { status: 404 })
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const auth = verifyNewsWriteAuth(req, "");
      if (!auth.ok && auth.response) {
        return withSecurityHeaders(auth.response);
      }

      const formData = await req.formData();
      const rawJsonField = formData.get("payload") ?? formData.get("data");
      if (typeof rawJsonField === "string" && rawJsonField.trim()) {
        payload = JSON.parse(rawJsonField) as Record<string, unknown>;
      }

      // Allow top-level scalar fields in formData as well
      for (const field of [
        "slug",
        "title",
        "date",
        "readTime",
        "category",
        "excerpt",
        "lead",
        "image",
        "videoSrc",
      ]) {
        const val = formData.get(field);
        if (typeof val === "string" && val.trim()) {
          payload[field] = val.trim();
        }
      }

      const rawMirror = formData.get("mirrorExternalMedia");
      if (typeof rawMirror === "string") {
        payload.mirrorExternalMedia = rawMirror.trim().toLowerCase() === "true";
      }

      const rawHighlights = formData.get("highlights");
      if (typeof rawHighlights === "string" && rawHighlights.trim()) {
        payload.highlights = JSON.parse(rawHighlights);
      }

      const rawSections = formData.get("sections");
      if (typeof rawSections === "string" && rawSections.trim()) {
        payload.sections = JSON.parse(rawSections);
      }

      // Process uploaded cover image file if provided
      const imageFile =
        formData.get("imageFile") ??
        (formData.get("image") instanceof File ? formData.get("image") : null);
      if (imageFile instanceof File && imageFile.size > 0) {
        const buf = Buffer.from(await imageFile.arrayBuffer());
        const savedImg = await saveUploadedMediaBuffer(buf, "image");
        payload.image = savedImg.url;
      }

      // Process uploaded video file if provided
      const videoFile =
        formData.get("videoFile") ??
        (formData.get("video") instanceof File ? formData.get("video") : null);
      if (videoFile instanceof File && videoFile.size > 0) {
        const buf = Buffer.from(await videoFile.arrayBuffer());
        const savedVid = await saveUploadedMediaBuffer(buf, "video");
        payload.videoSrc = savedVid.url;
        payload.isVideo = true;
      }

      // Check if any sectionImage_${i} files were uploaded
      const baseSections = Array.isArray(payload.sections)
        ? payload.sections
        : existing.sections.map((sec) => ({
            ...sec,
            paragraphs: [...sec.paragraphs],
          }));

      let sectionImageModified = false;
      for (let i = 0; i < baseSections.length; i++) {
        const secFile = formData.get(`sectionImage_${i}`);
        if (secFile instanceof File && secFile.size > 0) {
          const buf = Buffer.from(await secFile.arrayBuffer());
          const savedSecImg = await saveUploadedMediaBuffer(buf, "image");
          const secObj = baseSections[i] as Record<string, unknown>;
          if (secObj && typeof secObj === "object") {
            secObj.image = savedSecImg.url;
            sectionImageModified = true;
          }
        }
      }
      if (sectionImageModified && !Array.isArray(payload.sections)) {
        payload.sections = baseSections;
      }
    } else {
      const rawBody = await req.text();
      if (Buffer.byteLength(rawBody, "utf8") > MAX_JSON_BODY_BYTES) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: "Request JSON body exceeds 256 KB limit." },
            { status: 413 }
          )
        );
      }

      const auth = verifyNewsWriteAuth(req, rawBody);
      if (!auth.ok && auth.response) {
        return withSecurityHeaders(auth.response);
      }
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    }

    // Optional: if mirrorExternalMedia === true, download remote media links locally
    if (payload.mirrorExternalMedia === true) {
      if (
        typeof payload.image === "string" &&
        payload.image.startsWith("http")
      ) {
        const mirrored = await downloadAndSaveExternalMedia(
          payload.image,
          "image"
        );
        payload.image = mirrored.url;
      }
      if (
        typeof payload.videoSrc === "string" &&
        payload.videoSrc.startsWith("http")
      ) {
        const mirrored = await downloadAndSaveExternalMedia(
          payload.videoSrc,
          "video"
        );
        payload.videoSrc = mirrored.url;
      }
      if (Array.isArray(payload.sections)) {
        for (const sec of payload.sections) {
          if (sec && typeof sec === "object") {
            const s = sec as Record<string, unknown>;
            if (typeof s.image === "string" && s.image.startsWith("http")) {
              const mirrored = await downloadAndSaveExternalMedia(
                s.image,
                "image"
              );
              s.image = mirrored.url;
            }
          }
        }
      }
    }

    // Note: We do NOT force payload.slug = safeSlug here.
    // If payload.slug is omitted, validateAndBuildNewsArticle(..., existing) keeps existing.slug.
    // If payload.slug is provided, it validates the new slug and updates the article in-place via targetSlug.
    const updatedArticle = validateAndBuildNewsArticle(payload, existing);
    await upsertNewsArticle(updatedArticle, {
      allowOverwrite: true,
      targetSlug: safeSlug,
    });

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${safeSlug}`);
    if (updatedArticle.slug !== safeSlug) {
      revalidatePath(`/news/${updatedArticle.slug}`);
    }

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          previousSlug: safeSlug,
          article: updatedArticle,
        },
        { status: 200 }
      )
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update article.";
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 400 })
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = verifyNewsWriteAuth(req, "");
  if (!auth.ok && auth.response) {
    return withSecurityHeaders(auth.response);
  }

  try {
    const { slug } = await params;
    const safeSlug = validateSlug(slug);
    const deleted = await deleteNewsBySlug(safeSlug);

    if (!deleted) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Article not found." }, { status: 404 })
      );
    }

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${safeSlug}`);

    return withSecurityHeaders(
      NextResponse.json({ ok: true, deletedSlug: safeSlug }, { status: 200 })
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete article.";
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 400 })
    );
  }
}
