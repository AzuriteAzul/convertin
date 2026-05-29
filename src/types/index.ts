import { z } from "zod";

// --- Profile types ---

export const ExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const EducationSchema = z.object({
  school: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;

export const ScrapedProfileSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  headline: z.string().optional().default(""),
  photoUrl: z.string().optional().default(""),
  about: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  location: z.string().optional().default(""),
  experience: z.array(ExperienceSchema).optional().default([]),
  education: z.array(EducationSchema).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
});

export type ScrapedProfile = z.infer<typeof ScrapedProfileSchema>;

export const ProfileUpdateSchema = ScrapedProfileSchema.partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export interface Profile {
  id: string;
  sessionToken: string;
  fullName: string;
  headline: string;
  photoUrl: string;
  about: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  location: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  languages: string[];
  scrapeStatus: "full" | "partial" | "failed";
  createdAt: string;
  expiresAt: string;
}

// --- CV types ---

export const CvSectionSchema = z.object({
  type: z.enum([
    "summary",
    "experience",
    "education",
    "skills",
    "certifications",
    "languages",
    "contact",
    "linkedinNote",
  ]),
  heading: z.string(),
  items: z.array(
    z.union([
      z.string(),
      z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional(),
      }),
    ]),
  ),
});

export const CvJsonSchema = z.object({
  sections: z.array(CvSectionSchema),
  metadata: z
    .object({
      suggestedTemplate: z.enum(["modern", "classic", "minimal"]).optional(),
      colorAccent: z.string().optional(),
    })
    .optional(),
});

export type CvSection = z.infer<typeof CvSectionSchema>;
export type CvJson = z.infer<typeof CvJsonSchema>;

export interface Cv {
  id: string;
  profileId: string;
  targetRole: string;
  template: string;
  cvJson: CvJson;
  pdfStoragePath: string | null;
  createdAt: string;
}

// --- API types ---

export interface ProfileCreateResponse {
  profileId: string;
  token: string;
}

export interface CvGenerateRequest {
  profileToken: string;
  targetRole: string;
  template?: string;
  accentColor?: string;
  language?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  photoUrl?: string;
}

export interface CvGenerateResponse {
  cvId: string;
}

export interface PhotoUploadResponse {
  photoUrl: string;
}
