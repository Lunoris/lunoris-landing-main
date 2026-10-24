import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { detectMediaMagicBytes } from "@/lib/mediaUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "news");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Strict filename validation against Path Traversal
    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\") ||
      !/^[a-zA-Z0-9._-]+$/.test(filename)
    ) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    const filePath = path.join(UPLOAD_DIR, filename);
    const buf = await fs.readFile(filePath);
    const detected = detectMediaMagicBytes(buf);
    const contentType = detected?.mime || "application/octet-stream";

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media file not found." }, { status: 404 });
  }
}
