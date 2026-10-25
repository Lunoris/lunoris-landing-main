import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { detectMediaMagicBytes } from "@/lib/mediaUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.resolve(process.cwd(), "public", "uploads", "news");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  let fileHandle: fs.FileHandle | null = null;
  try {
    const { filename } = await params;

    // 1. Strict filename validation against Path Traversal & hidden dotfiles (e.g. .gitkeep)
    if (
      !filename ||
      filename.startsWith(".") ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\") ||
      !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(filename)
    ) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    const filePath = path.resolve(UPLOAD_DIR, filename);
    if (!filePath.startsWith(UPLOAD_DIR + path.sep)) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    fileHandle = await fs.open(filePath, "r");
    const stat = await fileHandle.stat();
    if (!stat.isFile() || stat.size < 12) {
      return NextResponse.json({ error: "Media file not found." }, { status: 404 });
    }

    // 2. Read only the first 16 bytes to verify Magic Bytes without loading entire 60MB videos
    const headerBuf = Buffer.alloc(16);
    const { bytesRead } = await fileHandle.read(headerBuf, 0, 16, 0);
    const detected = detectMediaMagicBytes(headerBuf.subarray(0, bytesRead));
    if (!detected) {
      return NextResponse.json(
        { error: "Unsupported media file." },
        { status: 404 }
      );
    }

    const totalSize = stat.size;
    const rangeHeader = req.headers.get("range");

    // 3. Support HTTP Range (206 Partial Content) for efficient video streaming & memory safety
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const maxChunk = 4 * 1024 * 1024; // 4 MB max per range chunk
      const requestedEnd = endStr ? parseInt(endStr, 10) : Math.min(totalSize - 1, start + maxChunk - 1);
      const end = Math.min(totalSize - 1, requestedEnd);

      if (
        Number.isNaN(start) ||
        Number.isNaN(end) ||
        start < 0 ||
        start >= totalSize ||
        end < start
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
            "X-Content-Type-Options": "nosniff",
          },
        });
      }

      const chunkLength = end - start + 1;
      const chunkBuf = Buffer.alloc(chunkLength);
      await fileHandle.read(chunkBuf, 0, chunkLength, start);

      return new NextResponse(new Uint8Array(chunkBuf), {
        status: 206,
        headers: {
          "Content-Type": detected.mime,
          "Content-Length": String(chunkLength),
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const fullBuf = Buffer.alloc(totalSize);
    await fileHandle.read(fullBuf, 0, totalSize, 0);

    return new NextResponse(new Uint8Array(fullBuf), {
      status: 200,
      headers: {
        "Content-Type": detected.mime,
        "Content-Length": String(totalSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Media file not found." }, { status: 404 });
  } finally {
    if (fileHandle) {
      await fileHandle.close().catch(() => undefined);
    }
  }
}
