import { describe, it, expect } from "vitest";
import {
  ScrapedProfileSchema,
  CvJsonSchema,
  ExperienceSchema,
  EducationSchema,
} from "@/types";

describe("ExperienceSchema", () => {
  it("validates a complete experience entry", () => {
    const result = ExperienceSchema.safeParse({
      company: "Acme Inc",
      title: "Senior Developer",
      startDate: "2020-01",
      endDate: "2024-01",
      description: "Led team of 5",
      location: "San Francisco",
    });
    expect(result.success).toBe(true);
  });

  it("validates a minimal experience entry", () => {
    const result = ExperienceSchema.safeParse({
      company: "Startup",
      title: "Developer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing company", () => {
    const result = ExperienceSchema.safeParse({
      title: "Developer",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = ExperienceSchema.safeParse({
      company: "Acme",
    });
    expect(result.success).toBe(false);
  });
});

describe("EducationSchema", () => {
  it("validates a complete education entry", () => {
    const result = EducationSchema.safeParse({
      school: "MIT",
      degree: "BS",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
    });
    expect(result.success).toBe(true);
  });

  it("validates school-only entry", () => {
    const result = EducationSchema.safeParse({
      school: "MIT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing school", () => {
    const result = EducationSchema.safeParse({
      degree: "BS",
    });
    expect(result.success).toBe(false);
  });
});

describe("ScrapedProfileSchema", () => {
  const validProfile = {
    fullName: "John Doe",
    headline: "Software Engineer",
    photoUrl: "https://example.com/photo.jpg",
    about: "Experienced developer",
    location: "San Francisco",
    experience: [{ company: "Acme", title: "Dev" }],
    education: [{ school: "MIT", degree: "BS" }],
    skills: ["TypeScript", "React"],
    certifications: ["AWS"],
    languages: ["English"],
  };

  it("validates a complete profile", () => {
    const result = ScrapedProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("validates a minimal profile with only name", () => {
    const result = ScrapedProfileSchema.safeParse({
      fullName: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("provides defaults for missing fields", () => {
    const result = ScrapedProfileSchema.parse({ fullName: "Jane Doe" });
    expect(result.headline).toBe("");
    expect(result.about).toBe("");
    expect(result.photoUrl).toBe("");
    expect(result.experience).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.skills).toEqual([]);
  });

  it("rejects empty name", () => {
    const result = ScrapedProfileSchema.safeParse({
      fullName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name entirely", () => {
    const result = ScrapedProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid experience shape", () => {
    const result = ScrapedProfileSchema.safeParse({
      fullName: "John",
      experience: [{ badField: 123 }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts arrays of strings for skills", () => {
    const result = ScrapedProfileSchema.safeParse({
      fullName: "John",
      skills: ["TypeScript", "React", "Node.js"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toHaveLength(3);
    }
  });
});

describe("CvJsonSchema", () => {
  const validCv = {
    sections: [
      {
        type: "summary",
        heading: "Professional Summary",
        items: ["Experienced developer..."],
      },
      {
        type: "experience",
        heading: "Professional Experience",
        items: [
          {
            title: "Senior Developer",
            subtitle: "Acme Inc",
            date: "2020 - 2024",
            description: "Led engineering team, delivered projects...",
          },
        ],
      },
      {
        type: "education",
        heading: "Education",
        items: [
          {
            title: "BS in Computer Science",
            subtitle: "MIT",
            date: "2016 - 2020",
          },
        ],
      },
      {
        type: "skills",
        heading: "Skills",
        items: ["TypeScript", "React", "Node.js", "AWS"],
      },
    ],
    metadata: {
      suggestedTemplate: "modern",
      colorAccent: "#2563eb",
    },
  };

  it("validates a complete CV JSON", () => {
    const result = CvJsonSchema.safeParse(validCv);
    expect(result.success).toBe(true);
  });

  it("validates CV with string items in sections", () => {
    const result = CvJsonSchema.safeParse({
      sections: [
        { type: "summary", heading: "Summary", items: ["Hello"] },
        { type: "skills", heading: "Skills", items: ["A", "B", "C"] },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("validates CV without metadata", () => {
    const result = CvJsonSchema.safeParse({
      sections: [{ type: "summary", heading: "Summary", items: ["Hi"] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid section type", () => {
    const result = CvJsonSchema.safeParse({
      sections: [{ type: "invalid_type", heading: "X", items: [] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing sections array", () => {
    const result = CvJsonSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid template name", () => {
    const result = CvJsonSchema.safeParse({
      sections: [{ type: "summary", heading: "X", items: ["Hi"] }],
      metadata: { suggestedTemplate: "fancy_template" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid template names", () => {
    for (const tpl of ["modern", "classic", "minimal"]) {
      const result = CvJsonSchema.safeParse({
        sections: [{ type: "summary", heading: "X", items: ["Hi"] }],
        metadata: { suggestedTemplate: tpl },
      });
      expect(result.success).toBe(true);
    }
  });

  it("validates mixed item types in same section", () => {
    const result = CvJsonSchema.safeParse({
      sections: [
        {
          type: "experience",
          heading: "Experience",
          items: [
            "Brief note",
            { title: "Role", subtitle: "Company", description: "Details" },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
