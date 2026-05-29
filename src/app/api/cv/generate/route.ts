import { NextRequest, NextResponse } from "next/server";
import { getProfileByToken, insertCv } from "@/lib/db";
import { generateCvJson } from "@/lib/llm";
import { dbToProfile } from "@/lib/utils";
import { CvGenerateRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: CvGenerateRequest = await request.json();

    if (!body.profileToken || !body.targetRole) {
      return NextResponse.json(
        { error: "profileToken and targetRole are required" },
        { status: 400 },
      );
    }

    // Fetch profile
    const profileData = getProfileByToken(body.profileToken);

    if (!profileData) {
      return NextResponse.json(
        { error: "Profile not found or expired" },
        { status: 404 },
      );
    }

    const profile = dbToProfile(profileData);

    // Extract email/phone/linkedinUrl from raw_data if available, but prefer client-provided values
    const rawData = (profileData.raw_data || {}) as Record<string, unknown>;
    const email = body.email || (rawData.email as string) || "";
    const phone = body.phone || (rawData.phone as string) || "";
    const linkedinUrl = (rawData.linkedinUrl as string) || profile.linkedinUrl || "";

    // Generate CV using LLM
    const cvJson = await generateCvJson(
      {
        fullName: profile.fullName,
        headline: profile.headline,
        about: profile.about,
        photoUrl: profile.photoUrl,
        location: profile.location,
        email,
        phone,
        linkedinUrl,
        experience: profile.experience,
        education: profile.education,
        skills: profile.skills,
        certifications: profile.certifications,
        languages: profile.languages,
      },
      body.targetRole,
      undefined,
      body.language,
    );

    // Store CV in database
    const template = body.template || "modern";
    const accentColor = body.accentColor;

    // Overwrite the contact section in the LLM output with the user's actual
    // email/phone/linkedinUrl. The LLM may use stale data from the profile text
    // instead of the values we explicitly provided, so we force-correct them.
    const sections = (cvJson as Record<string, unknown>).sections as Array<Record<string, unknown>>;
    const contactIndex = sections?.findIndex((s) => s.type === "contact") ?? -1;
    if (contactIndex >= 0 && sections) {
      const contactItems: Array<{ title: string; subtitle: string }> = [];
      if (email) contactItems.push({ title: email, subtitle: "Email" });
      if (phone) contactItems.push({ title: phone, subtitle: "Phone" });
      if (profile.location) contactItems.push({ title: profile.location, subtitle: "Location" });
      if (linkedinUrl) contactItems.push({ title: linkedinUrl, subtitle: "LinkedIn" });
      if (contactItems.length > 0) {
        sections[contactIndex] = {
          ...sections[contactIndex],
          items: contactItems,
        };
      }
    }

    // Inject accent color, email, phone, and photoUrl into cvJson metadata
    const enrichedCvJson = {
      ...cvJson,
      metadata: {
        ...((cvJson as Record<string, unknown>).metadata || {}),
        colorAccent: accentColor,
        email: email || undefined,
        phone: phone || undefined,
        linkedinUrl: linkedinUrl || undefined,
        photoUrl: body.photoUrl || undefined,
      },
    };

    const { id } = insertCv({
      profileId: profile.id,
      targetRole: body.targetRole,
      template,
      cvJson: enrichedCvJson,
    });

    return NextResponse.json({ cvId: id });
  } catch (err) {
    console.error("POST /api/cv/generate error:", err);
    return NextResponse.json(
      { error: "Failed to generate CV" },
      { status: 500 },
    );
  }
}