import { type ClassValue, clsx } from "clsx";
import type { Profile, Experience, Education } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function generateToken(): string {
  return crypto.randomUUID();
}

// Convert DB row (snake_case) to app Profile type (camelCase)
// SQLite rows have JSON columns already parsed by db.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbToProfile(row: any): Profile {
  const raw = (row.raw_data || {}) as Record<string, unknown>;
  // Migrate old photo URLs: /uploads/photos/TOKEN.ext → /api/photos/TOKEN
  let photoUrl = (row.photo_url as string) || "";
  if (photoUrl.startsWith("/uploads/photos/")) {
    const token = photoUrl.split("/").pop()?.split(".")[0] || "";
    photoUrl = `/api/photos/${token}`;
  }
  return {
    id: row.id as string,
    sessionToken: row.session_token as string,
    fullName: row.full_name as string,
    headline: (row.headline as string) || "",
    photoUrl,
    about: (row.about as string) || "",
    email: (raw.email as string) || "",
    phone: (raw.phone as string) || "",
    linkedinUrl: (raw.linkedinUrl as string) || "",
    location: (row.location as string) || "",
    experience: (row.experience || []) as Experience[],
    education: (row.education || []) as Education[],
    skills: (row.skills || []) as string[],
    certifications: (row.certifications || []) as string[],
    languages: (row.languages || []) as string[],
    scrapeStatus:
      (row.scrape_status as "full" | "partial" | "failed") || "partial",
    createdAt: row.created_at as string,
    expiresAt: row.expires_at as string,
  };
}