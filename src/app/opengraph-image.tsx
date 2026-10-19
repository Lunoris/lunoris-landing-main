import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Link-preview card (Slack, Discord, X, iMessage...). Rendered once at build.
export const alt = "Lunoris: Piece of Mind - an emotional 3D action-adventure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const root = process.cwd();
  const [art, wordmark, ovo] = await Promise.all([
    readFile(join(root, "public/assets/elar-joy.jpg"), "base64"),
    readFile(join(root, "public/assets/logo-wordmark.svg"), "base64"),
    readFile(join(root, "src/app/fonts/Ovo-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Ovo",
          color: "#ffffff",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${art}`}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(7,6,13,0.15) 0%, rgba(7,6,13,0.55) 48%, rgba(7,6,13,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 60,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <img
            src={`data:image/svg+xml;base64,${wordmark}`}
            width={430}
            height={98}
          />
          <div
            style={{
              marginTop: 18,
              fontSize: 46,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#fbbf24",
            }}
          >
            Piece of Mind
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 26,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#dcd6f0",
            }}
          >
            PC · PlayStation 5 · Xbox Series X|S · Free demo on Steam
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Ovo", data: ovo, weight: 400, style: "normal" }] }
  );
}
