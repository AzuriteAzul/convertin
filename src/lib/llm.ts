import OpenAI from "openai";
import { CvJsonSchema, ScrapedProfileSchema } from "@/types";
import type { ScrapedProfile } from "@/types";

let clientInstance: OpenAI | null = null;

function getClient(): OpenAI {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("Missing LLM_API_KEY environment variable");
  }

  clientInstance = new OpenAI({
    apiKey,
    baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
  });

  return clientInstance;
}

export function resetLlmClient() {
  clientInstance = null;
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: "English",
    zh: "Chinese",
    es: "Spanish",
    ar: "Arabic",
    pt: "Portuguese",
    fr: "French",
    de: "German",
    it: "Italian",
    nl: "Dutch",
    ja: "Japanese",
    ru: "Russian",
  };
  return names[code] || "English";
}

const SYSTEM_PROMPT = `You are a professional CV/resume writer specializing in one-page CVs.

IMPORTANT: Follow the language instructions at the end of this prompt carefully. Output ALL text in the requested language. If the candidate's profile data contains text in any other language, translate it to the requested language. The entire CV must be in the requested language — job titles, company descriptions, education entries, skill names, everything.

You receive a candidate's LinkedIn profile data and their target job role. Your task is to create a tailored, ATS-friendly CV that fits on ONE printed page (A4).

Guidelines:
- Include the top 2-3 MOST RELEVANT work experiences, ordered MOST RECENT FIRST
- Copy the FULL experience description from the profile — include all bullet points and achievements. Don't summarize or shorten them.
  IMPORTANT: If the description is not in English, TRANSLATE it to English.
  CRITICAL: Each bullet point in the description MUST be on its own line, separated by a literal "\n" (newline character). Every bullet line MUST start with "• " (bullet character + space + capital letter).
  Example format: "• Did X and Y\n• Led team of 5\n• Reduced costs by 20%"
  NEVER join bullet points into a single paragraph. NEVER omit the "• " prefix on each line. NEVER start a bullet with a lowercase letter — always capitalize the first letter after "• ".
- Include the top 1-2 MOST RELEVANT education entries, ordered MOST RECENT FIRST
- Pick the top 6-8 most relevant skills
- Write a compelling 2-3 sentence professional summary
- ALWAYS include ALL certifications and languages from the profile — place certifications in their own "certifications" section. Translate certification/language names to English if needed.
- Add a "contact" section with email, phone, location, and LinkedIn URL from the candidate data
- The headline/subtitle displayed on the CV header should be the candidate's CURRENT JOB TITLE only — extract just the role (e.g. "DevOps Engineer"), NOT the full headline with pipes, companies, or specializations. Remove any "for CompanyName", "at Company", "em Empresa", "chez Société", "bei Firma", or similar employer suffixes — those are NOT part of the job title.
- Add a "linkedinNote" section as the LAST section

Output a JSON object with this exact structure:
{
  "sections": [
    {
      "type": "summary",
      "heading": "Professional Summary",
      "items": ["summary text here"]
    },
    {
      "type": "contact",
      "heading": "Contact",
      "items": [
        { "title": "email@example.com", "subtitle": "Email" },
        { "title": "+351 912 345 678", "subtitle": "Phone" },
        { "title": "Lisbon, Portugal", "subtitle": "Location" },
        { "title": "linkedin.com/in/username", "subtitle": "LinkedIn" }
      ]
    },
    {
      "type": "experience",
      "heading": "Professional Experience",
      "items": [
        {
          "title": "Job Title",
          "subtitle": "Company Name",
          "date": "Jan 2020 - Present",
          "description": "• Achievement bullet 1\\n• Achievement bullet 2\\n• Achievement bullet 3"
        }
      ]
    },
    {
      "type": "education",
      "heading": "Education",
      "items": [
        {
          "title": "Degree in Field",
          "subtitle": "University Name",
          "date": "2016 - 2020"
        }
      ]
    },
    {
      "type": "skills",
      "heading": "Skills",
      "items": ["Skill 1", "Skill 2"]
    },
    {
      "type": "certifications",
      "heading": "Certifications",
      "items": ["Certification Name 1", "Certification Name 2"]
    },
    {
      "type": "languages",
      "heading": "Languages",
      "items": ["Language 1", "Language 2"]
    },
    {
      "type": "linkedinNote",
      "heading": "",
      "items": ["Additional experience & details on LinkedIn"]
    }
  ],
  "metadata": {
    "suggestedTemplate": "modern",
    "colorAccent": "#2563eb"
  }
}`;

const PDF_PARSE_PROMPT = `You are a profile data extractor. Extract structured profile data from LinkedIn PDF text.

Return ONLY a JSON object with this exact structure...`;

export async function generateCvJson(
  profile: ScrapedProfile,
  targetRole: string,
  customUserMessage?: string,
  language?: string,
): Promise<Record<string, unknown>> {
  const client = getClient();

  const userMessage =
    customUserMessage ||
    JSON.stringify({
      candidate: {
        name: profile.fullName,
        headline: profile.headline,
        about: profile.about,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        experience: profile.experience,
        education: profile.education,
        skills: profile.skills,
        certifications: profile.certifications,
        languages: profile.languages,
      },
      targetRole,
    });

  const languageName = getLanguageName(language || "en");
  const basePrompt = customUserMessage ? PDF_PARSE_PROMPT : SYSTEM_PROMPT;

  // Build language-specific instruction
  const langInstruction = `\n\nCRITICAL LANGUAGE INSTRUCTION: The ENTIRE CV output MUST be in ${languageName}. Translate ALL content to ${languageName} — job titles, company names, experience descriptions, education entries, skill names, certifications, languages, summary, and any other text. If the candidate's profile data is in any other language, translate it to ${languageName}. Do NOT leave any text untranslated.`;

  const systemPrompt = basePrompt + langInstruction;

  const model = process.env.LLM_MODEL || "gpt-4o";

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 8192,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty response");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    // LLM response was truncated — attempt to repair by closing open structures
    const repaired = content + '"]}}';
    try {
      parsed = JSON.parse(repaired);
    } catch {
      throw new Error(
        "LLM returned invalid JSON. The response may have been truncated. Please try again.",
      );
    }
  }

  // PDF parsing mode: validate against profile schema, not CV schema
  if (customUserMessage) {
    const result = ScrapedProfileSchema.parse(parsed);
    return result as unknown as Record<string, unknown>;
  }

  const result = CvJsonSchema.parse(parsed);
  return result;
}