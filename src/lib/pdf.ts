import type { CvJson } from "@/types";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { CvTemplateModern } from "@/components/CvTemplateModern";
import { CvTemplateProfessional } from "@/components/CvTemplateProfessional";
import { CvTemplateHarvard } from "@/components/CvTemplateHarvard";
import { CvTemplateSimple } from "@/components/CvTemplateSimple";

type TemplateName = "modern" | "professional" | "harvard" | "simple";

interface RenderCvPdfOptions {
  cvJson: CvJson;
  template: TemplateName;
  photoUrl?: string;
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  location?: string;
  accentColor?: string;
}

/**
 * Calculate a font scale factor based on how much text content the CV has.
 * Sparse content (new grad / student) → large fonts (up to 1.55x).
 * Dense content (senior with decades) → small fonts (down to 0.82x).
 *
 * A sparse CV should fill the A4 page — we push font sizes, spacing, and
 * section margins much harder at the low end so nothing looks empty.
 */
function calculateFontScale(cvJson: CvJson): number {
  let totalChars = 0;
  let itemCount = 0;

  for (const section of cvJson.sections || []) {
    for (const item of section.items) {
      itemCount++;
      if (typeof item === "string") {
        totalChars += item.length;
      } else {
        totalChars += (item.title || "").length;
        totalChars += (item.subtitle || "").length;
        totalChars += (item.description || "").length;
        totalChars += (item.date || "").length;
      }
    }
  }

  // Combine character count and item count into a density score
  // More characters + more items = denser content = smaller scale
  const density = totalChars + itemCount * 80;

  if (density < 300) return 1.55; // Barely any content — max everything out
  if (density < 600) return 1.35; // Very sparse (single job, short education)
  if (density < 1000) return 1.2; // Sparse (new grad)
  if (density < 1800) return 1.08; // Light / junior
  if (density < 2800) return 1.0; // Normal / early career
  if (density < 4200) return 0.93; // Mid-level
  if (density < 6000) return 0.87; // Senior
  return 0.82; // Extremely dense (decades of experience)
}

export async function renderCvPdf({
  cvJson,
  template,
  photoUrl,
  fullName,
  headline,
  email,
  phone,
  linkedinUrl,
  location,
  accentColor,
}: RenderCvPdfOptions): Promise<Buffer> {
  const fontScale = calculateFontScale(cvJson);

  const props = {
    data: cvJson,
    photoUrl,
    fullName,
    headline,
    email,
    phone,
    linkedinUrl,
    location,
    accentColor,
    fontScale,
  };

  let element: React.ReactElement;
  switch (template) {
    case "professional":
      element = React.createElement(CvTemplateProfessional, props);
      break;
    case "harvard":
      element = React.createElement(CvTemplateHarvard, props);
      break;
    case "simple":
      element = React.createElement(CvTemplateSimple, props);
      break;
    case "modern":
    default:
      element = React.createElement(CvTemplateModern, props);
      break;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
