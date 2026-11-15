import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readAuthenticatedFormData,
  readAuthenticatedJsonText,
  verifyNewsWriteAuth,
  withSecurityHeaders,
} from "@/lib/newsAuth";
import {
  downloadAndSaveExternalMedia,
  saveUploadedFileObject,
} from "@/lib/mediaUpload";
import {
  isClientValidationError,
  isPlainObject,
  NewsValidationError,
  validateAndBuildNewsArticle,
  validateSlug,
} from "@/lib/newsValidator";
import {
  deleteNewsBySlug,
  getNewsBySlug,
  upsertNewsArticle,
} from "@/lib/newsStore";
import type { NewsArticle } from "@/data/newsData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_JSON_BODY_BYTES = 256 * 1024; // 256 KB
const MAX_SECTION_UPLOADS = 20;

async function mirrorArticleExternalMedia(
  article: NewsArticle
): Promise<NewsArticle> {
  let image = article.image;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    const mirrored = await downloadAndSaveExternalMedia(image, "image");
    image = mirrored.url;
  }

  let videoSrc = article.videoSrc;
  if (
    videoSrc &&
    (videoSrc.startsWith("http://") || videoSrc.startsWith("https://"))
  ) {
    const mirrored = await downloadAndSaveExternalMedia(videoSrc, "video");
    videoSrc = mirrored.url;
  }

  const sections = await Promise.all(
    article.sections.map(async (sec) => {
      if (
        sec.image &&
        (sec.image.startsWith("http://") || sec.image.startsWith("https://"))
      ) {
        const mirrored = await downloadAndSaveExternalMedia(sec.image, "image");
        return { ...sec, image: mirrored.url };
      }
      return sec;
    })
  );

  return {
    ...article,
    image,
    ...(videoSrc ? { videoSrc } : {}),
    sections,
  };
}

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
    if (isClientValidationError(err)) {
      return withSecurityHeaders(
        NextResponse.json({ error: err.message }, { status: err.statusCode })
      );
    }
    return withSecurityHeaders(
      NextResponse.json({ error: "Failed to load article." }, { status: 500 })
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};
    let formData: FormData | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formResult = await readAuthenticatedFormData(req);
      if (!formResult.ok) {
        return formResult.response;
      }
      formData = formResult.formData;
    } else {
      const bodyResult = await readAuthenticatedJsonText(req, MAX_JSON_BODY_BYTES);
      if (!bodyResult.ok) {
        return bodyResult.response;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(bodyResult.rawBody);
      } catch {
        throw new NewsValidationError("Invalid JSON body.");
      }
      if (!isPlainObject(parsed)) {
        throw new NewsValidationError("Request body must be a JSON object.");
      }
      payload = parsed;
    }

    const { slug } = await params;
    const safeSlug = validateSlug(slug);
    const existing = await getNewsBySlug(safeSlug);

    if (!existing) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Article not found." }, { status: 404 })
      );
    }

    if (formData) {
      const rawJsonField = formData.get("payload") ?? formData.get("data");
      if (typeof rawJsonField === "string" && rawJsonField.trim()) {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(rawJsonField);
        } catch {
          throw new NewsValidationError('Invalid JSON in "payload" field.');
        }
        if (!isPlainObject(parsedJson)) {
          throw new NewsValidationError('"payload" field must be a JSON object.');
        }
        payload = parsedJson;
      }

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
        try {
          payload.highlights = JSON.parse(rawHighlights);
        } catch {
          throw new NewsValidationError('Invalid JSON in "highlights" field.');
        }
      }

      const rawSections = formData.get("sections");
      if (typeof rawSections === "string" && rawSections.trim()) {
        try {
          payload.sections = JSON.parse(rawSections);
        } catch {
          throw new NewsValidationError('Invalid JSON in "sections" field.');
        }
      }

      const imageFile =
        formData.get("imageFile") ??
        (formData.get("image") instanceof File ? formData.get("image") : null);
      if (imageFile instanceof File && imageFile.size > 0) {
        const savedImg = await saveUploadedFileObject(imageFile, "image");
        payload.image = savedImg.url;
      }

      const videoFile =
        formData.get("videoFile") ??
        (formData.get("video") instanceof File ? formData.get("video") : null);
      if (videoFile instanceof File && videoFile.size > 0) {
        const savedVid = await saveUploadedFileObject(videoFile, "video");
        payload.videoSrc = savedVid.url;
        payload.isVideo = true;
      }

      const baseSections = Array.isArray(payload.sections)
        ? payload.sections
        : existing.sections.map((sec) => ({
            ...sec,
            paragraphs: [...sec.paragraphs],
          }));

      let sectionImageModified = false;
      const maxSections = Math.min(MAX_SECTION_UPLOADS, baseSections.length);
      for (let i = 0; i < maxSections; i++) {
        const secFile = formData.get(`sectionImage_${i}`);
        if (secFile instanceof File && secFile.size > 0) {
          const savedSecImg = await saveUploadedFileObject(secFile, "image");
          const secObj = baseSections[i];
          if (isPlainObject(secObj)) {
            secObj.image = savedSecImg.url;
            sectionImageModified = true;
          }
        }
      }
      if (sectionImageModified && !Array.isArray(payload.sections)) {
        payload.sections = baseSections;
      }
    }

    // Validate full schema & limits BEFORE mirroring external media
    let updatedArticle = validateAndBuildNewsArticle(payload, existing);

    if (payload.mirrorExternalMedia === true) {
      updatedArticle = await mirrorArticleExternalMedia(updatedArticle);
    }

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
    if (isClientValidationError(err)) {
      return withSecurityHeaders(
        NextResponse.json({ error: err.message }, { status: err.statusCode })
      );
    }
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Failed to update article." },
        { status: 500 }
      )
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
    if (isClientValidationError(err)) {
      return withSecurityHeaders(
        NextResponse.json({ error: err.message }, { status: err.statusCode })
      );
    }
    return withSecurityHeaders(
      NextResponse.json(
        { error: "Failed to delete article." },
        { status: 500 }
      )
    );
  }
}
