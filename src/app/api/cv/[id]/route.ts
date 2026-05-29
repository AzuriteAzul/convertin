import { NextRequest, NextResponse } from "next/server";
import { getCvById } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = getCvById(id);

    if (!data) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json({
      cv: {
        id: data.id,
        profileId: data.profile_id,
        targetRole: data.target_role,
        template: data.template,
        cvJson: data.cv_json,
        createdAt: data.created_at,
      },
    });
  } catch (err) {
    console.error("GET /api/cv/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}