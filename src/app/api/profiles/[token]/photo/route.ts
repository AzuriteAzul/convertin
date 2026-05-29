import { NextRequest, NextResponse } from "next/server";
import { getProfileByToken, updateProfile } from "@/lib/db";
import { uploadPhoto, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 },
      );
    }

    const photo = formData.get("photo");

    if (!photo || !(photo instanceof File)) {
      return NextResponse.json(
        { error: 'Missing "photo" file field in form data' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(photo.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPEG, WebP" },
        { status: 400 },
      );
    }

    // Validate file size
    if (photo.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 },
      );
    }

    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB" },
        { status: 400 },
      );
    }

    // Verify the profile exists and hasn't expired
    const profile = getProfileByToken(token);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found or expired" },
        { status: 404 },
      );
    }

    // Upload to local storage
    let photoUrl: string;
    try {
      photoUrl = await uploadPhoto(token, photo);
    } catch (uploadErr) {
      console.error("Photo upload failed:", uploadErr);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 },
      );
    }

    // Update the profile record
    const updated = updateProfile(token, { photoUrl });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update profile with photo URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ photoUrl });
  } catch (err) {
    console.error("POST /api/profiles/[token]/photo error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}