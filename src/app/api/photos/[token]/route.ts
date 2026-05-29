import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "data", "uploads", "photos");

const EXT_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!fs.existsSync(PHOTOS_DIR)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Find the file matching the token (could be .png, .jpg, .webp)
    const files = fs.readdirSync(PHOTOS_DIR);
    const matchedFile = files.find((f) => f.startsWith(`${token}.`));

    if (!matchedFile) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const filePath = path.join(PHOTOS_DIR, matchedFile);
    const ext = path.extname(matchedFile).toLowerCase().slice(1);
    const mimeType = EXT_TO_MIME[ext] || "image/jpeg";

    const buffer = fs.readFileSync(filePath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("GET /api/photos/[token] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}