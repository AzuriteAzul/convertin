import fs from "fs";
import path from "path";

const PHOTOS_DIR = path.join(process.cwd(), "data", "uploads", "photos");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function ensurePhotosDir(): void {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }
}

function getFileExtension(file: File): string {
  const name = file.name;
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex > 0) {
    return name.slice(dotIndex + 1).toLowerCase();
  }

  const mimeToExt: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };

  return mimeToExt[file.type] ?? "jpg";
}

export async function uploadPhoto(token: string, file: File): Promise<string> {
  ensurePhotosDir();

  const ext = getFileExtension(file);
  const filename = `${token}.${ext}`;
  const filePath = path.join(PHOTOS_DIR, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filePath, buffer);

  // Return URL without extension — the /api/photos/[token] route finds the file by prefix
  return `/api/photos/${token}`;
}

export async function deletePhoto(token: string): Promise<void> {
  // Find and delete any file starting with the token prefix
  if (!fs.existsSync(PHOTOS_DIR)) {
    return;
  }

  const files = fs.readdirSync(PHOTOS_DIR);
  const toDelete = files.filter((f) => f.startsWith(`${token}.`));

  for (const file of toDelete) {
    const filePath = path.join(PHOTOS_DIR, file);
    fs.unlinkSync(filePath);
  }
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE };