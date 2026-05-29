import { NextRequest, NextResponse } from "next/server";
import { insertProfile } from "@/lib/db";
import { generateToken } from "@/lib/utils";
import { generateCvJson } from "@/lib/llm";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

const PARSE_PROMPT = `Extract structured profile data from this LinkedIn profile PDF text.

IMPORTANT: Scan the ENTIRE text for contact information. LinkedIn PDFs usually contain email addresses, phone numbers, and the LinkedIn profile URL in the contact section or header. Look for patterns like someone@domain.com for email, +XX XXX XXX XXX for phone, and linkedin.com/in/username for the LinkedIn URL.

Return ONLY a JSON object:
{
  "fullName": "...",
  "headline": "...",
  "photoUrl": "",
  "about": "...",
  "email": "found email or empty string",
  "phone": "found phone or empty string",
  "linkedinUrl": "found LinkedIn URL or empty string",
  "location": "...",
  "experience": [{"company":"...","title":"...","startDate":"Month Year","endDate":"Month Year or Present","description":"..."}],
  "education": [{"school":"...","degree":"...","field":"...","startDate":"Year","endDate":"Year"}],
  "skills": ["Skill1","Skill2"],
  "certifications": ["Cert name"],
  "languages": ["Lang name"]
}

Rules: extract ALL items from each section, preserve dates, keep descriptions compact, use empty array if section absent, photoUrl always empty string. CRITICAL: find and extract the actual email address and phone number from the PDF text — do NOT leave them as empty strings if they exist.

LinkedIn PDF text:`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;

    if (
      !file ||
      (!file.name.toLowerCase().endsWith(".pdf") &&
        file.type !== "application/pdf")
    ) {
      return NextResponse.json(
        { error: "PDF file required" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const [{ PDFParse }, { createRequire }] = await Promise.all([
      import("pdf-parse"),
      import("node:module"),
    ]);
    const require = createRequire(import.meta.url);
    const workerPath =
      require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    PDFParse.setWorker(workerPath);

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = new PDFParse({ data: buffer });
    const pdfData = await pdf.getText();
    const rawText = pdfData.text.substring(0, 12000);
    await pdf.destroy();

    const result = await generateCvJson(
      {
        fullName: "x",
        headline: "",
        about: "",
        photoUrl: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        location: "",
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
      },
      "parsing",
      PARSE_PROMPT + "\n\n" + rawText,
    );

    if (!result || !(result as any).fullName) {
      return NextResponse.json(
        { error: "Could not extract profile" },
        { status: 422, headers: corsHeaders() },
      );
    }

    const token = generateToken();

    const { id } = insertProfile({
      sessionToken: token,
      fullName: (result as any).fullName || "",
      headline: (result as any).headline || "",
      photoUrl: "",
      about: (result as any).about || "",
      location: (result as any).location || "",
      experience: (result as any).experience || [],
      education: (result as any).education || [],
      skills: (result as any).skills || [],
      certifications: (result as any).certifications || [],
      languages: (result as any).languages || [],
      scrapeStatus: "full",
      rawData: {
        source: "linkedin_pdf",
        rawText,
        email: (result as any).email || "",
        phone: (result as any).phone || "",
        linkedinUrl: (result as any).linkedinUrl || "",
      },
    });

    return NextResponse.json(
      { profileId: id, token },
      { headers: corsHeaders() },
    );
  } catch (err) {
    console.error("PDF upload error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}