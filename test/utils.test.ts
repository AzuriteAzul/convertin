import { describe, it, expect } from "vitest";
import { generateToken, dbToProfile } from "@/lib/utils";
import type { Profile } from "@/types";

describe("generateToken", () => {
  it("returns a string", () => {
    const token = generateToken();
    expect(typeof token).toBe("string");
  });

  it("returns a UUID v4 format", () => {
    const token = generateToken();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(token).toMatch(uuidRegex);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
  });
});

describe("dbToProfile", () => {
  it("converts a full DB row to Profile", () => {
    const row = {
      id: "abc-123",
      session_token: "token-xyz",
      full_name: "John Doe",
      headline: "Software Engineer",
      photo_url: "https://example.com/photo.jpg",
      about: "Experienced developer",
      location: "San Francisco",
      experience: [
        {
          company: "Acme Inc",
          title: "Senior Dev",
          startDate: "2020-01",
          endDate: "2024-01",
          description: "Built stuff",
        },
      ],
      education: [
        {
          school: "MIT",
          degree: "BS",
          field: "CS",
          startDate: "2016",
          endDate: "2020",
        },
      ],
      skills: ["TypeScript", "React"],
      certifications: ["AWS"],
      languages: ["English"],
      scrape_status: "full",
      created_at: "2024-01-01T00:00:00Z",
      expires_at: "2024-01-02T00:00:00Z",
    };

    const profile = dbToProfile(row);

    expect(profile.id).toBe("abc-123");
    expect(profile.sessionToken).toBe("token-xyz");
    expect(profile.fullName).toBe("John Doe");
    expect(profile.headline).toBe("Software Engineer");
    expect(profile.photoUrl).toBe("https://example.com/photo.jpg");
    expect(profile.about).toBe("Experienced developer");
    expect(profile.location).toBe("San Francisco");
    expect(profile.experience).toHaveLength(1);
    expect(profile.experience[0].company).toBe("Acme Inc");
    expect(profile.experience[0].title).toBe("Senior Dev");
    expect(profile.education).toHaveLength(1);
    expect(profile.education[0].school).toBe("MIT");
    expect(profile.skills).toEqual(["TypeScript", "React"]);
    expect(profile.scrapeStatus).toBe("full");
  });

  it("handles missing optional fields with defaults", () => {
    const row = {
      id: "min-123",
      session_token: "min-token",
      full_name: "Jane",
    };

    const profile = dbToProfile(row);

    expect(profile.fullName).toBe("Jane");
    expect(profile.headline).toBe("");
    expect(profile.photoUrl).toBe("");
    expect(profile.about).toBe("");
    expect(profile.location).toBe("");
    expect(profile.experience).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.skills).toEqual([]);
    expect(profile.certifications).toEqual([]);
    expect(profile.languages).toEqual([]);
    expect(profile.scrapeStatus).toBe("partial");
  });

  it("handles null values gracefully", () => {
    const row = {
      id: "null-123",
      session_token: "null-token",
      full_name: null,
      headline: null,
      photo_url: null,
      about: null,
      location: null,
      experience: null,
      education: null,
      skills: null,
      certifications: null,
      languages: null,
      scrape_status: null,
    };

    const profile = dbToProfile(row);

    expect(profile.fullName).toBeNull();
    expect(profile.headline).toBe("");
    expect(profile.photoUrl).toBe("");
    expect(profile.experience).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.skills).toEqual([]);
    expect(profile.scrapeStatus).toBe("partial");
  });

  it("handles empty experience/education arrays", () => {
    const row = {
      id: "empty-123",
      session_token: "empty-token",
      full_name: "Test",
      experience: [],
      education: [],
      skills: [],
    };

    const profile = dbToProfile(row);
    expect(profile.experience).toEqual([]);
    expect(profile.education).toEqual([]);
    expect(profile.skills).toEqual([]);
  });
});
