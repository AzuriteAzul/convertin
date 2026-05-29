import Database from "better-sqlite3";
import path from "path";
import fs from "fs";


// --- Database singleton ---

let dbInstance: Database.Database | null = null;

const DB_PATH = path.join(process.cwd(), "data", "convertin.db");

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbInstance = new Database(DB_PATH);

  // Enable WAL mode for concurrent read performance
  dbInstance.pragma("journal_mode = WAL");

  // Create tables if they don't exist
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id              TEXT PRIMARY KEY,
      session_token   TEXT UNIQUE NOT NULL,
      full_name       TEXT,
      headline        TEXT,
      photo_url       TEXT,
      about           TEXT,
      location        TEXT,
      experience      TEXT DEFAULT '[]',
      education       TEXT DEFAULT '[]',
      skills          TEXT DEFAULT '[]',
      certifications  TEXT DEFAULT '[]',
      languages       TEXT DEFAULT '[]',
      scrape_status   TEXT DEFAULT 'partial',
      raw_data        TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      expires_at      TEXT DEFAULT (datetime('now', '+24 hours'))
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_token ON profiles(session_token);
    CREATE INDEX IF NOT EXISTS idx_profiles_expires ON profiles(expires_at);

    CREATE TABLE IF NOT EXISTS cvs (
      id                TEXT PRIMARY KEY,
      profile_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      target_role       TEXT NOT NULL,
      template          TEXT DEFAULT 'modern',
      cv_json           TEXT NOT NULL,
      pdf_storage_path  TEXT,
      created_at        TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_cvs_profile ON cvs(profile_id);
  `);

  // Clean up expired profiles on init
  cleanupExpiredProfiles();

  return dbInstance;
}

export function resetDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// --- Cleanup ---

export function cleanupExpiredProfiles(): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("DELETE FROM profiles WHERE expires_at < ?").run(now);
}

// --- JSON column helpers ---

const JSON_COLUMNS = new Set([
  "experience",
  "education",
  "skills",
  "certifications",
  "languages",
  "raw_data",
  "cv_json",
]);

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = JSON_COLUMNS.has(key) && value !== undefined && value !== null
      ? JSON.stringify(value)
      : value;
  }
  return result;
}

function deserializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (JSON_COLUMNS.has(key) && typeof value === "string") {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

// --- Profile CRUD ---

export function insertProfile(profile: {
  sessionToken: string;
  fullName: string;
  headline?: string;
  photoUrl?: string;
  about?: string;
  location?: string;
  experience?: unknown[];
  education?: unknown[];
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  scrapeStatus?: string;
  rawData?: unknown;
}): { id: string } {
  const db = getDb();
  const id = crypto.randomUUID();

  const row = serializeRow({
    id,
    session_token: profile.sessionToken,
    full_name: profile.fullName,
    headline: profile.headline || "",
    photo_url: profile.photoUrl || "",
    about: profile.about || "",
    location: profile.location || "",
    experience: profile.experience || [],
    education: profile.education || [],
    skills: profile.skills || [],
    certifications: profile.certifications || [],
    languages: profile.languages || [],
    scrape_status: profile.scrapeStatus || "partial",
    raw_data: profile.rawData || null,
  });

  const columns = Object.keys(row).join(", ");
  const placeholders = Object.keys(row)
    .map(() => "?")
    .join(", ");
  const values = Object.values(row);

  db.prepare(`INSERT INTO profiles (${columns}) VALUES (${placeholders})`).run(
    ...values,
  );

  return { id };
}

export function getProfileByToken(token: string): Record<string, unknown> | null {
  const db = getDb();
  const now = new Date().toISOString();

  const row = db
    .prepare(
      "SELECT * FROM profiles WHERE session_token = ? AND expires_at > ?",
    )
    .get(token, now) as Record<string, unknown> | undefined;

  if (!row) return null;
  return deserializeRow(row);
}

export function updateProfile(
  token: string,
  data: Record<string, unknown>,
): Record<string, unknown> | null {
  const db = getDb();
  const now = new Date().toISOString();

  // Check profile exists and hasn't expired
  const existing = db
    .prepare(
      "SELECT id, raw_data FROM profiles WHERE session_token = ? AND expires_at > ?",
    )
    .get(token, now) as Record<string, unknown> | undefined;

  if (!existing) return null;

  // Build update object
  const updateData: Record<string, unknown> = {};

  // Map camelCase to snake_case
  const fieldMap: Record<string, string> = {
    fullName: "full_name",
    headline: "headline",
    photoUrl: "photo_url",
    about: "about",
    location: "location",
    experience: "experience",
    education: "education",
    skills: "skills",
    certifications: "certifications",
    languages: "languages",
  };

  for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
    if (data[camelKey] !== undefined) {
      updateData[snakeKey] = data[camelKey];
    }
  }

  // Handle email/phone/linkedinUrl in raw_data
  if (
    data.email !== undefined ||
    data.phone !== undefined ||
    data.linkedinUrl !== undefined
  ) {
    const currentRaw =
      typeof existing.raw_data === "string"
        ? JSON.parse(existing.raw_data)
        : existing.raw_data || {};
    const newRaw = { ...(currentRaw as Record<string, unknown>) };
    if (data.email !== undefined) newRaw.email = data.email;
    if (data.phone !== undefined) newRaw.phone = data.phone;
    if (data.linkedinUrl !== undefined) newRaw.linkedinUrl = data.linkedinUrl;
    updateData.raw_data = newRaw;
  }

  if (Object.keys(updateData).length === 0) {
    // No updates, just return current profile
    const current = getProfileByToken(token);
    return current;
  }

  const serialized = serializeRow(updateData);
  const setClauses = Object.keys(serialized)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(serialized), token];

  db.prepare(`UPDATE profiles SET ${setClauses} WHERE session_token = ?`).run(
    ...values,
  );

  return getProfileByToken(token);
}

// --- CV CRUD ---

export function insertCv(cv: {
  profileId: string;
  targetRole: string;
  template?: string;
  cvJson: unknown;
}): { id: string } {
  const db = getDb();
  const id = crypto.randomUUID();

  const row = serializeRow({
    id,
    profile_id: cv.profileId,
    target_role: cv.targetRole,
    template: cv.template || "modern",
    cv_json: cv.cvJson,
  });

  const columns = Object.keys(row).join(", ");
  const placeholders = Object.keys(row)
    .map(() => "?")
    .join(", ");
  const values = Object.values(row);

  db.prepare(`INSERT INTO cvs (${columns}) VALUES (${placeholders})`).run(
    ...values,
  );

  return { id };
}

export function getCvById(
  id: string,
): Record<string, unknown> | null {
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM cvs WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return null;
  return deserializeRow(row);
}

export function getProfileById(
  id: string,
): Record<string, unknown> | null {
  const db = getDb();

  const row = db
    .prepare("SELECT * FROM profiles WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!row) return null;
  return deserializeRow(row);
}