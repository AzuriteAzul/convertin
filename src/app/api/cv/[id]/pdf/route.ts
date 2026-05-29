import { NextRequest, NextResponse } from "next/server";
import { getCvById, getProfileById } from "@/lib/db";
import { renderCvPdf } from "@/lib/pdf";
import fs from "fs";
import path from "path";

/**
 * Read a photo file from local storage and convert it to a base64 data URL.
 * Handles both old format ("/uploads/photos/TOKEN.ext") and new format ("/api/photos/TOKEN").
 */
function readPhotoAsDataUrl(photoPath: string): string | null {
  try {
    // Extract the last path segment — could be "TOKEN.ext" or just "TOKEN"
    const lastSegment = photoPath.split("/").pop();
    if (!lastSegment) return null;

    const PHOTOS_DIR = path.join(process.cwd(), "data", "uploads", "photos");

    if (!fs.existsSync(PHOTOS_DIR)) return null;

    // If the segment has an extension, use it directly
    let filePath: string;
    if (lastSegment.includes(".")) {
      filePath = path.join(PHOTOS_DIR, lastSegment);
    } else {
      // No extension — find the file by token prefix
      const files = fs.readdirSync(PHOTOS_DIR);
      const matched = files.find((f) => f.startsWith(`${lastSegment}.`));
      if (!matched) return null;
      filePath = path.join(PHOTOS_DIR, matched);
    }

    if (!fs.existsSync(filePath)) return null;

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };

    const mimeType = mimeMap[ext] || "image/jpeg";
    const base64 = buffer.toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cvData = getCvById(id);

    if (!cvData) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Fetch associated profile for name, headline, and photo
    let fullName: string | undefined;
    let headline: string | undefined;
    let photoUrl: string | undefined;
    let email: string | undefined;
    let phone: string | undefined;
    let location: string | undefined;

    if (cvData.profile_id) {
      const profileData = getProfileById(cvData.profile_id as string);

      if (profileData) {
        fullName = (profileData.full_name as string) || undefined;
        // Trim headline to just the job title:
        // Remove everything after @, |, -, —, · and also after
        // "for Company", "at Company", "em Empresa", "chez Société", "bei Firma", "en Empresa"
        const rawHeadline = (profileData.headline as string) || "";
        headline =
          rawHeadline
            .split(/\s[\@\|\-\–\·]\s/)[0]
            .split(
              /\s+(?:for|at|em|chez|bei|en|no|na|su|presso|para|por)\s+(?=[A-Z])/i,
            )[0]
            .trim() || undefined;
        location = (profileData.location as string) || undefined;
        // Extract email/phone from raw_data
        const raw = (profileData.raw_data || {}) as Record<string, unknown>;
        email = (raw.email as string) || undefined;
        phone = (raw.phone as string) || undefined;

        // Read the photo from local storage instead of fetching via HTTP
        const rawPhotoUrl = (profileData.photo_url as string) || "";
        if (rawPhotoUrl) {
          const dataUrl = readPhotoAsDataUrl(rawPhotoUrl);
          photoUrl = dataUrl || undefined;
        }
      }
    }

    const template = ((cvData.template as string) || "modern") as "modern" | "professional" | "harvard" | "simple";

    // Read metadata from cv_json early (needed for accent color fallback and photoUrl)
    const cvJsonMeta = (cvData.cv_json as Record<string, unknown>).metadata as
      | Record<string, unknown>
      | undefined;
    const accentColor = (cvJsonMeta?.colorAccent as string) || undefined;
    const linkedinUrl = (cvJsonMeta?.linkedinUrl as string) || undefined;
    // Prefer profile's current email/phone over stale CV metadata
    // (user may have updated their profile after generating the CV)
    email = email || (cvJsonMeta?.email as string) || undefined;
    phone = phone || (cvJsonMeta?.phone as string) || undefined;

    // Read photo from local storage, then fall back to metadata
    if (!photoUrl) {
      const metaPhoto = (cvJsonMeta?.photoUrl as string) || "";
      if (metaPhoto) {
        const dataUrl = readPhotoAsDataUrl(metaPhoto);
        photoUrl = dataUrl || undefined;
      }
    }

    const pdfBuffer = await renderCvPdf({
      cvJson: cvData.cv_json as any,
      template,
      photoUrl,
      fullName,
      headline,
      email,
      phone,
      linkedinUrl,
      location,
      accentColor,
    });

    const filename = `cv-${(cvData.target_role as string)
      .replace(/\s+/g, "-")
      .toLowerCase()}.pdf`;

    // Use inline for preview (iframe), attachment for download
    const isDownload = request.nextUrl.searchParams.get("download") === "1";
    const disposition = isDownload
      ? `attachment; filename="${filename}"`
      : "inline";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": disposition,
      },
    });
  } catch (err) {
    console.error("GET /api/cv/[id]/pdf error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}