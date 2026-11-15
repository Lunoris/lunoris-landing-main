import { createReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import {
  detectMediaMagicBytes,
  LEGACY_PUBLIC_UPLOAD_DIR,
  LOCAL_UPLOAD_DIR,
} from "@/lib/mediaUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function openUploadFile(
  filename: string
): Promise<{ handle: fs.FileHandle; resolvedPath: string } | null> {
  for (const baseDir of [LOCAL_UPLOAD_DIR, LEGACY_PUBLIC_UPLOAD_DIR]) {
    const candidate = path.resolve(baseDir, filename);
    if (!candidate.startsWith(baseDir + path.sep)) {
      continue;
    }
    try {
      const handle = await fs.open(candidate, "r");
      return { handle, resolvedPath: candidate };
    } catch {
      // Try next storage directory
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  let fileHandle: fs.FileHandle | null = null;
  try {
    const { filename } = await params;

    // 1. Strict filename validation against Path Traversal & hidden dotfiles
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

    const opened = await openUploadFile(filename);
    if (!opened) {
      return NextResponse.json(
        { error: "Media file not found." },
        { status: 404 }
      );
    }

    fileHandle = opened.handle;
    const resolvedPath = opened.resolvedPath;

    const stat = await fileHandle.stat();
    if (!stat.isFile() || stat.size < 12) {
      return NextResponse.json(
        { error: "Media file not found." },
        { status: 404 }
      );
    }

    // 2. Read only the first 16 bytes to verify Magic Bytes
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

    // 3. Support HTTP Range (206 Partial Content) capped at 4 MB per chunk
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const maxChunk = 4 * 1024 * 1024;
      const requestedEnd = endStr
        ? parseInt(endStr, 10)
        : Math.min(totalSize - 1, start + maxChunk - 1);
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

    // 4. Stream full file without buffering up to 60 MB into RAM
    await fileHandle.close();
    fileHandle = null;

    const nodeStream = createReadStream(resolvedPath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    req.signal.addEventListener(
      "abort",
      () => {
        nodeStream.destroy();
      },
      { once: true }
    );

    return new NextResponse(webStream, {
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
    return NextResponse.json(
      { error: "Media file not found." },
      { status: 404 }
    );
  } finally {
    if (fileHandle) {
      await fileHandle.close().catch(() => undefined);
    }
  }
}
