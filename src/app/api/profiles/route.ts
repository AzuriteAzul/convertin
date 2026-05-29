import { NextRequest, NextResponse } from "next/server";
import { insertProfile } from "@/lib/db";
import { ScrapedProfileSchema } from "@/types";
import { generateToken } from "@/lib/utils";

// CORS headers helper
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate incoming profile data
    const parsed = ScrapedProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders() },
      );
    }

    const profile = parsed.data;
    const token = generateToken();

    // Insert profile into SQLite
    const result = insertProfile({
      sessionToken: token,
      fullName: profile.fullName,
      headline: profile.headline,
      photoUrl: profile.photoUrl,
      about: profile.about,
      location: profile.location,
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      certifications: profile.certifications,
      languages: profile.languages,
      scrapeStatus: body.scrapeStatus || "partial",
      rawData: body,
    });

    return NextResponse.json(
      { profileId: result.id, token },
      { headers: corsHeaders() },
    );
  } catch (err) {
    console.error("POST /api/profiles error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}