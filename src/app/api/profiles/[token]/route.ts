import { NextRequest, NextResponse } from "next/server";
import { getProfileByToken, updateProfile } from "@/lib/db";
import { ProfileUpdateSchema } from "@/types";
import { dbToProfile } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const data = getProfileByToken(token);

    if (!data) {
      return NextResponse.json(
        { error: "Profile not found or expired" },
        { status: 404 },
      );
    }

    const profile = dbToProfile(data);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("GET /api/profiles/[token] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile update", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = updateProfile(token, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: "Profile not found or expired" },
        { status: 404 },
      );
    }

    const profile = dbToProfile(updated);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("PUT /api/profiles/[token] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}