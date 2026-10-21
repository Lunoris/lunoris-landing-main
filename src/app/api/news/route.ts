import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyNewsWriteAuth, withSecurityHeaders } from "@/lib/newsAuth";
import {
  downloadAndSaveExternalMedia,
  saveUploadedMediaBuffer,
} from "@/lib/mediaUpload";
import { validateAndBuildNewsArticle } from "@/lib/newsValidator";
import { getAllNews, upsertNewsArticle } from "@/lib/newsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_JSON_BODY_BYTES = 256 * 1024; // 256 KB

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
    const auth = verifyNewsWriteAuth(req, "");
    if (!auth.ok && auth.response) {
      return withSecurityHeaders(auth.response);
    }

    try {
      const formData = await req.formData();

      // Allow base JSON inside "payload" or "data" field
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

      // Process section image files (e.g. sectionImage_0, sectionImage_1)
      if (Array.isArray(payload.sections)) {
        for (let i = 0; i < payload.sections.length; i++) {
          const secFile = formData.get(`sectionImage_${i}`);
          if (secFile instanceof File && secFile.size > 0) {
            const buf = Buffer.from(await secFile.arrayBuffer());
            const savedSecImg = await saveUploadedMediaBuffer(buf, "image");
            const secObj = payload.sections[i] as Record<string, unknown>;
            if (secObj && typeof secObj === "object") {
              secObj.image = savedSecImg.url;
            }
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Invalid multipart/form-data payload.";
      return withSecurityHeaders(
        NextResponse.json({ error: msg }, { status: 400 })
      );
    }
  } else {
    // Mode B: application/json (supports local media paths OR external https:// media URLs)
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

    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return withSecurityHeaders(
        NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
      );
    }
  }

  try {
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

    const article = validateAndBuildNewsArticle(payload);
    const allowOverwrite = payload.upsert !== false;
    const { created } = await upsertNewsArticle(article, { allowOverwrite });

    // Revalidate landing page, news archive, and single article page
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
    const message =
      err instanceof Error ? err.message : "Failed to publish news article.";
    return withSecurityHeaders(
      NextResponse.json({ error: message }, { status: 400 })
    );
  }
}
