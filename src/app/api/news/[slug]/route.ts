import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyNewsWriteAuth, withSecurityHeaders } from "@/lib/newsAuth";
import { saveUploadedMediaBuffer } from "@/lib/mediaUpload";
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

      const imageFile =
        formData.get("imageFile") ??
        (formData.get("image") instanceof File ? formData.get("image") : null);
      if (imageFile instanceof File && imageFile.size > 0) {
        const buf = Buffer.from(await imageFile.arrayBuffer());
        const savedImg = await saveUploadedMediaBuffer(buf, "image");
        payload.image = savedImg.url;
      }

      const videoFile =
        formData.get("videoFile") ??
        (formData.get("video") instanceof File ? formData.get("video") : null);
      if (videoFile instanceof File && videoFile.size > 0) {
        const buf = Buffer.from(await videoFile.arrayBuffer());
        const savedVid = await saveUploadedMediaBuffer(buf, "video");
        payload.videoSrc = savedVid.url;
        payload.isVideo = true;
      }
    } else {
      const rawBody = await req.text();
      const auth = verifyNewsWriteAuth(req, rawBody);
      if (!auth.ok && auth.response) {
        return withSecurityHeaders(auth.response);
      }
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    }

    payload.slug = safeSlug;
    const updatedArticle = validateAndBuildNewsArticle(payload, existing);
    await upsertNewsArticle(updatedArticle, { allowOverwrite: true });

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath(`/news/${safeSlug}`);

    return withSecurityHeaders(
      NextResponse.json({ ok: true, article: updatedArticle }, { status: 200 })
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
