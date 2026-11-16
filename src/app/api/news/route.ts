import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  readAuthenticatedFormData,
  readAuthenticatedJsonText,
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
} from "@/lib/newsValidator";
import { getAllNews, upsertNewsArticle } from "@/lib/newsStore";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const limitParam = searchParams.get("limit");

    let articles = await getAllNews();
    if (category && category !== "All") {
      articles = articles.filter((item) => item.category === category);
    }

    if (limitParam) {
      const limit = Number(limitParam);
      if (Number.isFinite(limit) && limit > 0) {
        articles = articles.slice(0, Math.min(100, Math.floor(limit)));
      }
    }

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          count: articles.length,
          articles,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      )
    );
  } catch {
    return withSecurityHeaders(
      NextResponse.json({ error: "Failed to load news." }, { status: 500 })
    );
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let payload: Record<string, unknown> = {};

  // Mode A: multipart/form-data (simultaneous article creation + binary media file upload)
  if (contentType.includes("multipart/form-data")) {
    const formResult = await readAuthenticatedFormData(req);
    if (!formResult.ok) {
      return formResult.response;
    }

    try {
      const { formData } = formResult;

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

      if (Array.isArray(payload.sections)) {
        const maxSections = Math.min(MAX_SECTION_UPLOADS, payload.sections.length);
        for (let i = 0; i < maxSections; i++) {
          const secFile = formData.get(`sectionImage_${i}`);
          if (secFile instanceof File && secFile.size > 0) {
            const savedSecImg = await saveUploadedFileObject(secFile, "image");
            const secObj = payload.sections[i];
            if (isPlainObject(secObj)) {
              secObj.image = savedSecImg.url;
            }
          }
        }
      }
    } catch (err) {
      if (isClientValidationError(err)) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: err.message },
            { status: err.statusCode }
          )
        );
      }
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Failed to process multipart upload." },
          { status: 500 }
        )
      );
    }
  } else {
    // Mode B: application/json
    const bodyResult = await readAuthenticatedJsonText(req, MAX_JSON_BODY_BYTES);
    if (!bodyResult.ok) {
      return bodyResult.response;
    }

    try {
      const parsed = JSON.parse(bodyResult.rawBody) as unknown;
      if (!isPlainObject(parsed)) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: "Request body must be a JSON object." },
            { status: 400 }
          )
        );
      }
      payload = parsed;
    } catch {
      return withSecurityHeaders(
        NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
      );
    }
  }

  try {
    // Validate full schema, section count (<=20), and external URL SSRF rules BEFORE mirroring any media
    let article = validateAndBuildNewsArticle(payload);

    if (payload.mirrorExternalMedia === true) {
      article = await mirrorArticleExternalMedia(article);
    }

    const allowOverwrite = payload.upsert !== false;
    const { created } = await upsertNewsArticle(article, { allowOverwrite });

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);

    return withSecurityHeaders(
      NextResponse.json(
        {
          ok: true,
          created,
          article,
        },
        { status: created ? 201 : 200 }
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
        { error: "Failed to publish news article." },
        { status: 500 }
      )
    );
  }
}
